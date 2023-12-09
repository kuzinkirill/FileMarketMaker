package repository

import (
	"context"
	"datafimaker/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Miner interface {
	GetMinerByAddress(ctx context.Context, tx pgx.Tx, address string) (*domain.Miner, error)
	GetMinerByMinerID(ctx context.Context, tx pgx.Tx, minerId int64) (*domain.Miner, error)
	GetMinerByOwnerAddress(ctx context.Context, tx pgx.Tx, address string) (*domain.Miner, error)
	GetMinerByID(ctx context.Context, tx pgx.Tx, id int64) (*domain.Miner, error)
	GetMiners(ctx context.Context, tx pgx.Tx, limit, offset int) ([]*domain.Miner, error)
	GetMinerStatsByMinerID(ctx context.Context, tx pgx.Tx, minerID int64) (*domain.MinerStats, error)
	GetMinerByActorID(ctx context.Context, tx pgx.Tx, actorId int64) (*domain.Miner, error)

	InsertMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) (int64, error)
	UpdateMiner(ctx context.Context, tx pgx.Tx, miner *domain.Miner) error
	InsertMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error
	UpdateMinerStats(ctx context.Context, tx pgx.Tx, stats *domain.MinerStats) error
}

type Deal interface {
	GetDeal(ctx context.Context, tx pgx.Tx, actorId int64, dealId int64) (*domain.Deal, error)
	GetDeals(ctx context.Context, tx pgx.Tx) ([]*domain.Deal, error)
	GetDealsByAddress(ctx context.Context, tx pgx.Tx, address string) ([]*domain.Deal, error)
	GetDealVestings(ctx context.Context, tx pgx.Tx, dealId int64) ([]*domain.Vesting, []*domain.Vesting, error)

	InsertDeal(ctx context.Context, tx pgx.Tx, deal *domain.Deal) (int64, error)
	InsertMinerVestingBatch(ctx context.Context, tx pgx.Tx, isMiner bool, vestings []*domain.Vesting) error
	UpdateDealGiver(ctx context.Context, tx pgx.Tx, id int64, address string) error
	UpdateDealStatus(ctx context.Context, tx pgx.Tx, id int64, status int) error
	UpdateMinerVesting(ctx context.Context, tx pgx.Tx, v *domain.Vesting) error
	UpdateGiverVesting(ctx context.Context, tx pgx.Tx, v *domain.Vesting) error
}

type Transactions interface {
	TransactionExists(ctx context.Context, tx pgx.Tx, id string) (bool, error)
	InsertTransaction(ctx context.Context, tx pgx.Tx, id string) error
}

type Repository interface {
	Miner
	Deal
	Transactions
	BlockCounter

	BeginTx(ctx context.Context, opts pgx.TxOptions) (pgx.Tx, error)
	CommitTx(ctx context.Context, tx pgx.Tx) error
	RollbackTx(ctx context.Context, tx pgx.Tx)
}

type postgresRepository struct {
	*blockCounter
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool, rdb *redis.Client) Repository {
	return &postgresRepository{
		pool: pool,
		blockCounter: &blockCounter{
			rdb: rdb,
		},
	}
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
