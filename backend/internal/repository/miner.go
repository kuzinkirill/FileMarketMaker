package repository

import (
	"context"
	"datafimaker/internal/domain"
	"fmt"
	"math/big"
	"strings"

	"github.com/jackc/pgx/v5"
)

func (r *postgresRepository) GetMinerByMinerID(ctx context.Context, tx pgx.Tx, minerId int64) (*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners WHERE id = $1`

	miner := &domain.Miner{}
	var balance string
	err := tx.QueryRow(ctx, query,
		minerId,
	).Scan(
		&miner.ID,
		&miner.ActorID,
		&miner.Address,
		&balance,
		&miner.OwnerAddress,
		&miner.WorkerAddress,
		&miner.BeneficiaryOwner,
		&miner.BeneficiaryContract,
		&miner.CreationTimestamp,
	)
	if err != nil {
		return nil, err
	}

	b, ok := new(big.Int).SetString(balance, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse balance: %s", balance)
	}
	miner.AvailableBalance = b

	return miner, nil
}

func (r *postgresRepository) GetMinerByAddress(ctx context.Context, tx pgx.Tx, address string) (*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners WHERE address = $1`

	miner := &domain.Miner{}
	var balance string
	err := tx.QueryRow(ctx, query,
		strings.ToLower(address),
	).Scan(
		&miner.ID,
		&miner.ActorID,
		&miner.Address,
		&balance,
		&miner.OwnerAddress,
		&miner.WorkerAddress,
		&miner.BeneficiaryOwner,
		&miner.BeneficiaryContract,
		&miner.CreationTimestamp,
	)
	if err != nil {
		return nil, err
	}

	b, ok := new(big.Int).SetString(balance, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse balance: %s", balance)
	}
	miner.AvailableBalance = b

	return miner, nil
}

func (r *postgresRepository) GetMinerByOwnerAddress(ctx context.Context, tx pgx.Tx, address string) (*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners WHERE beneficiary_owner = $1`

	miner := &domain.Miner{}
	var balance string
	err := tx.QueryRow(ctx, query,
		strings.ToLower(address),
	).Scan(
		&miner.ID,
		&miner.ActorID,
		&miner.Address,
		&balance,
		&miner.OwnerAddress,
		&miner.WorkerAddress,
		&miner.BeneficiaryOwner,
		&miner.BeneficiaryContract,
		&miner.CreationTimestamp,
	)
	if err != nil {
		return nil, err
	}

	b, ok := new(big.Int).SetString(balance, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse balance: %s", balance)
	}
	miner.AvailableBalance = b

	return miner, nil
}

func (r *postgresRepository) GetMinerByID(ctx context.Context, tx pgx.Tx, id int64) (*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners WHERE id = $1`

	miner := &domain.Miner{}
	var balance string
	err := tx.QueryRow(ctx, query,
		id,
	).Scan(
		&miner.ID,
		&miner.ActorID,
		&miner.Address,
		&balance,
		&miner.OwnerAddress,
		&miner.WorkerAddress,
		&miner.BeneficiaryOwner,
		&miner.BeneficiaryContract,
		&miner.CreationTimestamp,
	)
	if err != nil {
		return nil, err
	}

	b, ok := new(big.Int).SetString(balance, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse balance: %s", balance)
	}
	miner.AvailableBalance = b

	return miner, nil
}

func (r *postgresRepository) GetMinerByActorID(ctx context.Context, tx pgx.Tx, actorId int64) (*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners WHERE actor_id = $1`

	miner := &domain.Miner{}
	var balance string
	err := tx.QueryRow(ctx, query,
		actorId,
	).Scan(
		&miner.ID,
		&miner.ActorID,
		&miner.Address,
		&balance,
		&miner.OwnerAddress,
		&miner.WorkerAddress,
		&miner.BeneficiaryOwner,
		&miner.BeneficiaryContract,
		&miner.CreationTimestamp,
	)
	if err != nil {
		return nil, err
	}

	b, ok := new(big.Int).SetString(balance, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse balance: %s", balance)
	}
	miner.AvailableBalance = b

	return miner, nil
}

func (r *postgresRepository) GetMiners(ctx context.Context, tx pgx.Tx, limit, offset int) ([]*domain.Miner, error) {
	query := `SELECT id, actor_id, address, available_balance, owner_address, worker_address, beneficiary_owner, 
       			beneficiary_contract, creation_timestamp
	          FROM miners 
	          ORDER BY id 
	          LIMIT $1 OFFSET $2`

	rows, err := tx.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var miners []*domain.Miner
	for rows.Next() {
		miner := &domain.Miner{}
		var balance string
		err := rows.Scan(
			&miner.ID,
			&miner.ActorID,
			&miner.Address,
			&balance,
			&miner.OwnerAddress,
			&miner.WorkerAddress,
			&miner.BeneficiaryOwner,
			&miner.BeneficiaryContract,
			&miner.CreationTimestamp,
		)
		if err != nil {
			return nil, err
		}

		b, ok := new(big.Int).SetString(balance, 10)
		if !ok {
			return nil, fmt.Errorf("failed to parse balance: %s", balance)
		}
		miner.AvailableBalance = b

		miners = append(miners, miner)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return miners, nil
}

func (r *postgresRepository) InsertMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) (int64, error) {
	query := `INSERT INTO miners (id, actor_id, address, available_balance, owner_address, worker_address, 
                    beneficiary_owner, beneficiary_contract, creation_timestamp)
	          VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`

	err := tx.QueryRow(ctx, query,
		miner.ActorID,
		strings.ToLower(miner.Address),
		miner.AvailableBalance.String(),
		strings.ToLower(miner.OwnerAddress),
		strings.ToLower(miner.WorkerAddress),
		strings.ToLower(miner.BeneficiaryOwner),
		strings.ToLower(miner.BeneficiaryContract),
		miner.CreationTimestamp,
	).Scan(&miner.ID)
	if err != nil {
		return 0, err
	}

	return miner.ID, nil
}

func (r *postgresRepository) UpdateMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) error {
	query := `UPDATE miners SET 
				actor_id=$1, 
				available_balance=$2, 
				owner_address=$3, 
				worker_address=$4, 
                beneficiary_owner=$5, 
                beneficiary_contract=$6, 
                creation_timestamp=$7
	          WHERE id = $8`

	_, err := tx.Exec(ctx, query,
		miner.ActorID,
		miner.AvailableBalance.String(),
		strings.ToLower(miner.OwnerAddress),
		strings.ToLower(miner.WorkerAddress),
		strings.ToLower(miner.BeneficiaryOwner),
		strings.ToLower(miner.BeneficiaryContract),
		miner.CreationTimestamp,
		miner.ID,
	)

	return err
}

func (r *postgresRepository) GetMinerStatsByMinerID(ctx context.Context, tx pgx.Tx, minerID int64) (*domain.MinerStats, error) {
	query := `SELECT miner_id, locked_reward, blocks_mined, rewards 
	          FROM miner_last_year_stats WHERE miner_id = $1`

	stat := &domain.MinerStats{}
	var locked, rewards string
	err := tx.QueryRow(ctx, query,
		minerID,
	).Scan(
		&stat.MinerID,
		&locked,
		&stat.BlocksMined,
		&rewards,
	)
	if err != nil {
		return nil, err
	}

	var ok bool
	if stat.LockedRewards, ok = new(big.Int).SetString(locked, 10); !ok {
		return nil, fmt.Errorf("failed to parse miner stat locked reward: \"%s\"", locked)
	}

	if stat.Rewards, ok = new(big.Int).SetString(rewards, 10); !ok {
		return nil, fmt.Errorf("failed to parse miner stat rewards: \"%s\"", rewards)
	}

	return stat, nil
}

func (r *postgresRepository) InsertMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error {
	query := `INSERT INTO miner_last_year_stats (miner_id, locked_reward, blocks_mined, rewards)
	          VALUES ($1, $2, $3, $4)`

	_, err := tx.Exec(ctx, query,
		stats.MinerID,
		stats.LockedRewards.String(),
		stats.BlocksMined,
		stats.Rewards.String(),
	)

	return err
}

func (r *postgresRepository) UpdateMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error {
	query := `UPDATE miner_last_year_stats SET 
				  locked_reward = $1, 
				  blocks_mined = $2, 
				  rewards = $3
	          WHERE miner_id = $4`

	_, err := tx.Exec(ctx, query,
		stats.LockedRewards.String(),
		stats.BlocksMined,
		stats.Rewards.String(),
		stats.MinerID,
	)

	return err
}
