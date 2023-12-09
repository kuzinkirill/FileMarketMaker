package service

import (
	"context"
	"datafimaker/internal/domain"
	"datafimaker/models"
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v5"
)

func (s *service) GetMiners(ctx context.Context, limit, offset int) ([]*models.Miner, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	miners, err := s.repo.GetMiners(ctx, tx, limit, offset)
	if err != nil {
		log.Println("failed to get miners: ", err.Error())
		return nil, internalError
	}

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}

	return domain.MapSlice(miners, domain.MinerToModel), nil
}

func (s *service) GetMinerWithStatsByAddress(ctx context.Context, address common.Address) (*models.MinerWithStats, *models.ErrorResponse) {
	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	miner, err := s.repo.GetMinerByAddress(ctx, tx, address)
	if err != nil {
		log.Println("failed to get miner by addr: ", err.Error())
		return nil, internalError
	}

	stat, err := s.repo.GetMinerStatsByMinerID(ctx, tx, miner.ID)
	if err != nil {
		log.Println("failed to get miner stat: ", err.Error())
		return nil, internalError
	}

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}

	return &models.MinerWithStats{
		Miner: domain.MinerToModel(miner),
		Stat:  domain.MinerStatsToModel(stat),
	}, nil
}
