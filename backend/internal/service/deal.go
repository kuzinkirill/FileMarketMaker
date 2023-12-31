package service

import (
	"context"
	"datafimaker/internal/domain"
	"datafimaker/models"
	"log"

	"github.com/jackc/pgx/v5"
)

func (s *service) GetDeals(ctx context.Context) ([]*models.Deal, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	dbDeals, err := s.repo.GetDeals(ctx, tx)
	if err != nil {
		log.Println("failed to get deals: ", err)
		return nil, internalError
	}

	res := make([]*models.Deal, len(dbDeals))
	for i, d := range dbDeals {
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, d.ID)
		if err != nil {
			log.Println(err)
			return nil, internalError
		}

		miner, err := s.repo.GetMinerByMinerID(ctx, tx, d.MinerID)
		if err != nil {
			log.Println(err)
			return nil, internalError
		}

		d.MinerVestings, d.GiverVestings = minerVestings, giverVestings
		res[i] = domain.DealToModel(d, miner)
	}

	return res, nil
}

func (s *service) GetDealsByAddress(ctx context.Context, address string) ([]*models.Deal, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	dbDeals, err := s.repo.GetDealsByAddress(ctx, tx, address)
	if err != nil {
		log.Println("failed to get deals: ", err)
		return nil, internalError
	}

	res := make([]*models.Deal, len(dbDeals))
	for i, d := range dbDeals {
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, d.ID)
		if err != nil {
			log.Println(err)
			return nil, internalError
		}

		miner, err := s.repo.GetMinerByMinerID(ctx, tx, d.MinerID)
		if err != nil {
			log.Println(err)
			return nil, internalError
		}

		d.MinerVestings, d.GiverVestings = minerVestings, giverVestings
		res[i] = domain.DealToModel(d, miner)
	}

	return res, nil
}

func (s *service) GetDealById(ctx context.Context, id int64) (*models.Deal, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	deal, err := s.repo.GetDealById(ctx, tx, id)
	if err != nil {
		log.Println("failed to get deal: ", err)
		return nil, internalError
	}

	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		log.Println(err)
		return nil, internalError
	}

	miner, err := s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
	if err != nil {
		log.Println(err)
		return nil, internalError
	}

	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	res := domain.DealToModel(deal, miner)
	return res, nil
}

func (s *service) GetDealByMinerIdAndDealId(ctx context.Context, minerId int64, dealId int64) (*models.Deal, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	deal, err := s.repo.GetDeal(ctx, tx, minerId, dealId)
	if err != nil {
		log.Println("failed to get deal: ", err)
		return nil, internalError
	}

	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		log.Println(err)
		return nil, internalError
	}

	miner, err := s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
	if err != nil {
		log.Println(err)
		return nil, internalError
	}

	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	res := domain.DealToModel(deal, miner)
	return res, nil
}
