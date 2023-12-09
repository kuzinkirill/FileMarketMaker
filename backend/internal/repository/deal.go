package repository

import (
	"context"
	"datafimaker/internal/domain"
	"fmt"
	"math/big"
	"strings"

	"github.com/jackc/pgx/v5"
)

func (r *postgresRepository) GetDeal(ctx context.Context, tx pgx.Tx, minerId int64, dealId int64) (*domain.Deal, error) {
	query := `SELECT id, deal_id, miner_id, status, miner_value, giver_value, COALESCE(giver_address, '') 
			  FROM deals
			  WHERE miner_id=$1 AND deal_id=$2`

	var minerValue, giverValue string
	var deal = &domain.Deal{}
	err := tx.
		QueryRow(ctx, query, minerId, dealId).
		Scan(
			&deal.ID,
			&deal.DealID,
			&deal.MinerID,
			&deal.Status,
			&minerValue,
			&giverValue,
			&deal.Giver,
		)
	if err != nil {
		return nil, err
	}

	var ok bool
	deal.MinerValue, ok = new(big.Int).SetString(minerValue, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse miner value")
	}
	deal.GiverValue, ok = new(big.Int).SetString(giverValue, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse giver value")
	}

	return deal, nil
}

func (r *postgresRepository) GetDealVestings(ctx context.Context, tx pgx.Tx, dealId int64) ([]*domain.Vesting, []*domain.Vesting, error) {
	query := `SELECT locked_until,value,received FROM miner_vestings WHERE deal_id=$1 ORDER BY locked_until`

	var minerVestings, giverVestings []*domain.Vesting

	rows, err := tx.Query(ctx, query, dealId)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	for rows.Next() {
		v := &domain.Vesting{
			DealID: dealId,
		}
		var value, received string
		if err = rows.Scan(&v.LockedUntil, &value, &received); err != nil {
			return nil, nil, err
		}
		var ok bool
		v.Value, ok = big.NewInt(0).SetString(value, 10)
		if !ok {
			return nil, nil, fmt.Errorf("failed to parse miner vesting value: %s", value)
		}
		v.Received, ok = big.NewInt(0).SetString(received, 10)
		if !ok {
			return nil, nil, fmt.Errorf("failed to parse miner vesting received: %s", received)
		}
		minerVestings = append(minerVestings, v)
	}
	rows.Close()

	query = `SELECT locked_until,value,received FROM giver_vestings WHERE deal_id=$1 ORDER BY locked_until`
	rows, err = tx.Query(ctx, query, dealId)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	for rows.Next() {
		v := &domain.Vesting{
			DealID: dealId,
		}
		var value, received string
		if err = rows.Scan(&v.LockedUntil, &value, &received); err != nil {
			return nil, nil, err
		}
		var ok bool
		v.Value, ok = big.NewInt(0).SetString(value, 10)
		if !ok {
			return nil, nil, fmt.Errorf("failed to parse giver vesting value: %s", value)
		}
		v.Received, ok = big.NewInt(0).SetString(received, 10)
		if !ok {
			return nil, nil, fmt.Errorf("failed to parse giver vesting received: %s", received)
		}
		giverVestings = append(giverVestings, v)
	}
	rows.Close()

	return minerVestings, giverVestings, nil
}

func (r *postgresRepository) InsertDeal(ctx context.Context, tx pgx.Tx, deal *domain.Deal) (int64, error) {
	query := `INSERT INTO deals(id, deal_id, miner_id, status, miner_value, giver_value) 
			  VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING id`

	err := tx.QueryRow(ctx, query,
		deal.DealID,
		deal.MinerID,
		int32(deal.Status),
		deal.MinerValue.String(),
		deal.GiverValue.String(),
	).Scan(&deal.ID)
	if err != nil {
		return 0, err
	}

	return deal.ID, nil
}

func (r *postgresRepository) InsertMinerVestingBatch(ctx context.Context, tx pgx.Tx, isMiner bool, vestings []*domain.Vesting) error {
	var query string
	if isMiner {
		query = `INSERT INTO miner_vestings VALUES ($1,$2,$3,$4)`
	} else {
		query = `INSERT INTO giver_vestings VALUES ($1,$2,$3,$4)`
	}

	for _, v := range vestings {
		_, err := tx.Exec(ctx, query, v.DealID, v.LockedUntil, v.Value.String(), v.Received.String())
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *postgresRepository) GetDeals(ctx context.Context, tx pgx.Tx) ([]*domain.Deal, error) {
	query := `SELECT id, deal_id, miner_id, status, miner_value, giver_value 
              FROM deals WHERE status=$1`

	rows, err := tx.Query(ctx, query, domain.DealStatusCreated)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deals []*domain.Deal
	for rows.Next() {
		d := &domain.Deal{}
		var mValue, gValue string
		if err = rows.Scan(&d.ID, &d.DealID, &d.MinerID, &d.Status, &mValue, &gValue); err != nil {
			return nil, err
		}

		var ok bool
		d.MinerValue, ok = big.NewInt(0).SetString(mValue, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse miner value: %s", mValue)
		}
		d.GiverValue, ok = big.NewInt(0).SetString(gValue, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse giver value: %s", gValue)
		}
		deals = append(deals, d)
	}

	return deals, nil
}

func (r *postgresRepository) GetDealsByAddress(ctx context.Context, tx pgx.Tx, address string) ([]*domain.Deal, error) {
	query := `SELECT d.id, deal_id, miner_id, status, miner_value, giver_value, COALESCE(giver_address, '') 
              FROM deals d
              JOIN miners m ON m.id = d.miner_id
              WHERE d.giver_address=$1 OR m.beneficiary_owner=$1 `

	rows, err := tx.Query(ctx, query, strings.ToLower(address))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deals []*domain.Deal
	for rows.Next() {
		d := &domain.Deal{}
		var mValue, gValue string
		if err = rows.Scan(&d.ID, &d.DealID, &d.MinerID, &d.Status, &mValue, &gValue, &d.Giver); err != nil {
			return nil, err
		}

		var ok bool
		d.MinerValue, ok = big.NewInt(0).SetString(mValue, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse miner value: %s", mValue)
		}
		d.GiverValue, ok = big.NewInt(0).SetString(gValue, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse giver value: %s", gValue)
		}
		deals = append(deals, d)
	}

	return deals, nil
}

func (r *postgresRepository) UpdateDealGiver(ctx context.Context, tx pgx.Tx, id int64, address string) error {
	query := `UPDATE deals SET giver_address=$1 WHERE id=$2`
	_, err := tx.Exec(ctx, query, address, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresRepository) UpdateDealStatus(ctx context.Context, tx pgx.Tx, id int64, status int) error {
	query := `UPDATE deals SET status=$1 WHERE id=$2`
	_, err := tx.Exec(ctx, query, status, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresRepository) UpdateMinerVesting(ctx context.Context, tx pgx.Tx, v *domain.Vesting) error {
	query := `UPDATE miner_vestings SET received=$1 WHERE deal_id=$2 AND locked_until=$3`
	_, err := tx.Exec(ctx, query, v.Received.String(), v.DealID, v.LockedUntil)
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresRepository) UpdateGiverVesting(ctx context.Context, tx pgx.Tx, v *domain.Vesting) error {
	query := `UPDATE giver_vestings SET received=$1 WHERE deal_id=$2 AND locked_until=$3`
	_, err := tx.Exec(ctx, query, v.Received.String(), v.DealID, v.LockedUntil)
	if err != nil {
		return err
	}
	return nil
}
