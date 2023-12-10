package service

import (
	"context"
	"datafimaker/internal/config"
	"datafimaker/internal/repository"
	"datafimaker/models"
	"datafimaker/pkg/ethclient"
	"log"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
)

var (
	internalError = &models.ErrorResponse{
		Code:    500,
		Detail:  "",
		Message: "internal error",
	}
)

type EthClient interface {
	ethereum.ChainReader
	bind.ContractBackend
	ethereum.TransactionReader
}

type Service interface {
	GetMinerWithStatsByAddress(ctx context.Context, address string) (*models.MinerWithStats, *models.ErrorResponse)
	GetMiners(ctx context.Context, limit, offset int) ([]*models.Miner, *models.ErrorResponse)
	GetAccount(ctx context.Context, address string) (*models.Account, *models.ErrorResponse)

	GetDeals(ctx context.Context) ([]*models.Deal, *models.ErrorResponse)
	GetDealById(ctx context.Context, id int64) (*models.Deal, *models.ErrorResponse)
	GetDealsByAddress(ctx context.Context, address string) ([]*models.Deal, *models.ErrorResponse)

	CreateDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse)
	AcceptDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse)
	CancelDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse)
	WithdrawDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse)

	ListenBlockchain() error
	Shutdown()
}

type service struct {
	cfg       *config.ServiceConfig
	repo      repository.Repository
	ethClient ethclient.EthClient
	closeCh   chan struct{}
}

func New(cfg *config.ServiceConfig, repo repository.Repository) Service {
	ethClient, err := ethclient.NewEthClient(cfg.RpcUrls)
	if err != nil {
		log.Fatal(err)
	}

	return &service{
		cfg:       cfg,
		repo:      repo,
		ethClient: ethClient,
		closeCh:   make(chan struct{}),
	}
}

func (s *service) Shutdown() {
	s.closeCh <- struct{}{}
	close(s.closeCh)
}
