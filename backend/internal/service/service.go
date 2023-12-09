package service

import (
	"context"
	"datafimaker/internal/repository"
	"datafimaker/models"

	"github.com/ethereum/go-ethereum/common"
)

var (
	internalError = &models.ErrorResponse{
		Code:    500,
		Detail:  "",
		Message: "internal error",
	}
)

type Service interface {
	GetMinerWithStatsByAddress(ctx context.Context, address common.Address) (*models.MinerWithStats, *models.ErrorResponse)
	GetMiners(ctx context.Context, limit, offset int) ([]*models.Miner, *models.ErrorResponse)
}

type service struct {
	repo repository.Repository
}

func New(repo repository.Repository) Service {
	return &service{
		repo: repo,
	}
}
