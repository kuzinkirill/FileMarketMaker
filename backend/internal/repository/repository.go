package repository

import (
	"context"
	"datafimaker/internal/domain"

	"github.com/ethereum/go-ethereum/common"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Miner interface {
	GetMinerByAddress(ctx context.Context, tx pgx.Tx, address common.Address) (*domain.Miner, error)
	GetMinerByID(ctx context.Context, tx pgx.Tx, id int64) (*domain.Miner, error)
	GetMiners(ctx context.Context, tx pgx.Tx, limit, offset int) ([]*domain.Miner, error)
	GetMinerStatsByMinerID(ctx context.Context, tx pgx.Tx, minerID int64) (*domain.MinerStats, error)

	InsertMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) (int64, error)
	UpdateMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) error
	InsertMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error
	UpdateMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error
}

type Repository interface {
	Miner

	BeginTx(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error)
	CommitTx(ctx context.Context, tx pgx.Tx) error
	RollbackTx(ctx context.Context, tx pgx.Tx)
}

type postgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) Repository {
	return &postgresRepository{pool: pool}
}

func (r *postgresRepository) BeginTx(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error) {
	return r.pool.BeginTx(ctx, opts)
}

func (r *postgresRepository) CommitTx(ctx context.Context, tx pgx.Tx) error {
	return tx.Commit(ctx)
}

func (r *postgresRepository) RollbackTx(ctx context.Context, tx pgx.Tx) {
	tx.Rollback(ctx)
}
