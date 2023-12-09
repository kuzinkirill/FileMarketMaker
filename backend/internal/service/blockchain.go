package service

import (
	"context"
	"datafimaker/contracts/loan"
	"datafimaker/internal/domain"
	"log"
	"math/big"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/core/types"
	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
)

var (
	blockMapLock = &sync.Mutex{}
	blockLock    = map[uint64]*sync.Mutex{}
)

func (s *service) processBlock(block *types.Block) error {
	ctx, cancel := context.WithTimeout(context.Background(), 600*time.Second)
	defer cancel()

	blockMapLock.Lock()
	l, ok := blockLock[block.NumberU64()]
	if !ok {
		l = &sync.Mutex{}
		blockLock[block.NumberU64()] = l
	}
	blockMapLock.Unlock()
	l.Lock()
	defer l.Unlock()

	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer s.repo.RollbackTx(ctx, tx)

	for _, t := range block.Transactions() {
		if t.To() == nil {
			continue
		}
		if *t.To() == s.cfg.ProfitCollateralLoanContractAddress {
			exists, err := s.repo.TransactionExists(ctx, tx, strings.ToLower(t.Hash().String()))
			if err != nil {
				return err
			}
			if exists {
				continue
			}
			err = s.processLoanTx(ctx, tx, t)
			if err != nil {
				return err
			}
			err = s.repo.InsertTransaction(ctx, tx, strings.ToLower(t.Hash().String()))
			if err != nil {
				return err
			}
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func (s *service) ListenBlockchain() error {
	lastBlock, err := s.repo.GetLastBlock(context.Background())
	if err != nil {
		if err == redis.Nil {
			blockNum, err := s.ethClient.GetLatestBlockNumber(context.Background())
			if err != nil {
				return err
			}
			lastBlock = blockNum
		} else {
			return err
		}
	}

	for {
		select {
		case <-time.After(1000 * time.Millisecond):
			current, err := s.checkBlock(lastBlock)
			if err != nil {
				log.Printf("process block failed: %s", err.Error())
			}
			lastBlock = current
		case <-s.closeCh:
			return nil
		}
	}
}

func (s *service) checkBlock(latest *big.Int) (*big.Int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	blockNum, err := s.ethClient.GetLatestBlockNumber(ctx)
	if err != nil {
		log.Println("get latest block failed", err)
		return latest, err
	}
	if blockNum.Cmp(latest) != 0 {
		log.Println("processing block difference", latest, blockNum)
	}
	for blockNum.Cmp(latest) != 0 {
		latest, err = s.checkSingleBlock(latest)
		if err != nil {
			return latest, err
		}
	}
	return latest, nil
}

func (s *service) checkSingleBlock(latest *big.Int) (*big.Int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	pending := big.NewInt(0).Add(latest, big.NewInt(1))
	block, err := s.ethClient.BlockByNumber(ctx, pending)

	if err != nil {
		log.Println("get pending block failed", pending.String(), err)
		if !strings.Contains(err.Error(), "want 512 for Bloom") &&
			!strings.Contains(err.Error(), "requested epoch was a null round") {

			return latest, err
		}
	} else {
		err := s.processBlock(block)
		if err != nil {
			log.Println("process block failed", err)
			return latest, err
		}
	}

	if err := s.repo.SetLastBlock(ctx, pending); err != nil {
		log.Println("set last block failed: ", err)
	}
	return pending, err
}

// // Loan
// event LoanCanceled(uint64 actorId, uint256 id);
// event LoanMinerWithdrawn(uint64 actorId, uint256 id, uint256 value);
// event LoanGiverWithdrawn(uint64 actorId, uint256 id, uint256 value);
func (s *service) processLoanTx(ctx context.Context, tx pgx.Tx, t *types.Transaction) error {
	receipt, err := s.ethClient.TransactionReceipt(ctx, t.Hash())
	if err != nil {
		return err
	}

	for _, l := range receipt.Logs {
		instance, err := loan.NewProfitCollateralLoan(l.Address, nil)
		if err == nil {
			if _, err := s.processLoanPlaced(ctx, tx, instance, l); err != nil {
				log.Println("loan placed failed", err)
				return err
			}
			if _, err := s.processLoanAccepted(ctx, tx, instance, l); err != nil {
				log.Println("loan accept failed", err)
				return err
			}
			if _, err := s.processLoanCancelled(ctx, tx, instance, l); err != nil {
				log.Println("loan cancel failed", err)
				return err
			}
			if _, err := s.processLoanGiverWithdrawn(ctx, tx, instance, l); err != nil {
				log.Println("loan giver withdraw failed", err)
				return err
			}
			if _, err := s.processLoanMinerWithdrawn(ctx, tx, instance, l); err != nil {
				log.Println("loan miner withdraw failed", err)
				return err
			}
		}
	}

	return nil
}

// event MinerAdded(uint64 actorId, address beneficiary);
//func (s *service) processLoanMinerAdded(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) error {
//	ev, err := inst.ParseMinerAdded(*l)
//	if err != nil {
//		return nil
//	}
//
//	if _, err := s.repo.InsertMiner(ctx, tx, &domain.Miner{
//		ActorID:             int64(ev.ActorId),
//		BeneficiaryOwner:    ev.Beneficiary,
//		CreationTimestamp:   time.Now().UnixMilli(),
//		Address:             common.Address{},
//		AvailableBalance:    nil,
//		OwnerAddress:        common.Address{},
//		WorkerAddress:       common.Address{},
//		BeneficiaryContract: common.Address{},
//		LoanContract:        common.Address{},
//	}); err != nil {
//		return fmt.Errorf("failed to insert miner from event: %w", err)
//	}
//
//	return nil
//}

// event LoanPlaced(uint64 actorId, uint256 id, uint256[] giverSchedule, uint256[] giverValues, uint256[] minerSchedule, uint256[] minerValues);
func (s *service) processLoanPlaced(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) (*domain.Deal, error) {
	ev, err := inst.ParseLoanPlaced(*l)
	if err != nil {
		return nil, nil
	}

	miner, err := s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
	if err != nil {
		return nil, err
	}
	deal := &domain.Deal{
		DealID:     ev.Id.Int64(),
		MinerID:    miner.ID,
		Status:     domain.DealStatusCreated,
		MinerValue: big.NewInt(0),
		GiverValue: big.NewInt(0),
	}
	for i := 0; i < len(ev.MinerValues); i++ {
		deal.MinerValue = big.NewInt(0).Add(deal.MinerValue, ev.MinerValues[i])
	}
	for i := 0; i < len(ev.GiverValues); i++ {
		deal.GiverValue = big.NewInt(0).Add(deal.GiverValue, ev.GiverValues[i])
	}
	id, err := s.repo.InsertDeal(ctx, tx, deal)
	if err != nil {
		return nil, err
	}
	deal.ID = id

	n := len(ev.MinerValues)
	minerVestings := make([]*domain.Vesting, n)
	for i := 0; i < n; i++ {
		minerVestings[i] = &domain.Vesting{
			DealID:      id,
			LockedUntil: ev.MinerSchedule[i].Int64() * 1000,
			Value:       ev.MinerValues[i],
			Received:    big.NewInt(0),
		}
	}

	n = len(ev.GiverValues)
	giverVestings := make([]*domain.Vesting, n)
	for i := 0; i < n; i++ {
		giverVestings[i] = &domain.Vesting{
			DealID:      id,
			LockedUntil: ev.GiverSchedule[i].Int64() * 1000,
			Value:       ev.GiverValues[i],
			Received:    big.NewInt(0),
		}
	}

	if err := s.repo.InsertMinerVestingBatch(ctx, tx, true, minerVestings); err != nil {
		return nil, err
	}
	if err := s.repo.InsertMinerVestingBatch(ctx, tx, false, giverVestings); err != nil {
		return nil, err
	}
	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings

	return deal, nil
}

// event LoanAccepted(uint64 actorId, uint256 id, address giver);
func (s *service) processLoanAccepted(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) (*domain.Deal, error) {
	ev, err := inst.ParseLoanAccepted(*l)
	if err != nil {
		return nil, nil
	}

	miner, err := s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
	if err != nil {
		return nil, err
	}
	deal, err := s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
	if err != nil {
		return nil, err
	}
	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		return nil, err
	}
	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	deal.Giver = strings.ToLower(ev.Giver.String())
	deal.Status = domain.DealStatusAccepted
	err = s.repo.UpdateDealGiver(ctx, tx, deal.ID, deal.Giver)
	if err != nil {
		return nil, err
	}
	err = s.repo.UpdateDealStatus(ctx, tx, deal.ID, int(deal.Status))
	if err != nil {
		return nil, err
	}

	return deal, nil
}

// event LoanCanceled(uint64 actorId, uint256 id, address giver);
func (s *service) processLoanCancelled(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) (*domain.Deal, error) {
	ev, err := inst.ParseLoanCanceled(*l)
	if err != nil {
		return nil, nil
	}

	miner, err := s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
	if err != nil {
		return nil, err
	}
	deal, err := s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
	if err != nil {
		return nil, err
	}
	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		return nil, err
	}
	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	deal.Status = domain.DealStatusCancelled

	err = s.repo.UpdateDealStatus(ctx, tx, deal.ID, int(deal.Status))
	if err != nil {
		return nil, err
	}

	return deal, nil
}

// event LoanGiverWithdrawn(uint64 actorId, uint256 id, address giver);
func (s *service) processLoanGiverWithdrawn(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) (*domain.Deal, error) {
	ev, err := inst.ParseLoanGiverWithdrawn(*l)
	if err != nil {
		return nil, nil
	}

	miner, err := s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
	if err != nil {
		return nil, err
	}
	deal, err := s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
	if err != nil {
		return nil, err
	}
	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		return nil, err
	}
	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings

	leftValue := ev.Value
	for _, v := range deal.GiverVestings {
		allowed := big.NewInt(0).Sub(v.Value, v.Received)
		if leftValue.Cmp(allowed) == 1 {
			v.Received = v.Value
			leftValue = big.NewInt(0).Sub(leftValue, allowed)
		} else {
			v.Received = big.NewInt(0).Add(v.Received, leftValue)
			leftValue = big.NewInt(0)
		}
		err = s.repo.UpdateGiverVesting(ctx, tx, v)
		if err != nil {
			return nil, err
		}
	}
	err = s.updateStatusIfFinished(ctx, tx, deal)
	if err != nil {
		return nil, err
	}
	return deal, nil
}

// event LoanMinerWithdrawn(uint64 actorId, uint256 id, address giver);
func (s *service) processLoanMinerWithdrawn(ctx context.Context, tx pgx.Tx, inst *loan.ProfitCollateralLoan, l *types.Log) (*domain.Deal, error) {
	ev, err := inst.ParseLoanMinerWithdrawn(*l)
	if err != nil {
		return nil, nil
	}

	miner, err := s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
	if err != nil {
		return nil, err
	}
	deal, err := s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
	if err != nil {
		return nil, err
	}
	minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
	if err != nil {
		return nil, err
	}
	deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings

	leftValue := ev.Value
	for _, v := range deal.MinerVestings {
		allowed := big.NewInt(0).Sub(v.Value, v.Received)
		if leftValue.Cmp(allowed) == 1 {
			v.Received = v.Value
			leftValue = big.NewInt(0).Sub(leftValue, allowed)
		} else {
			v.Received = big.NewInt(0).Add(v.Received, leftValue)
			leftValue = big.NewInt(0)
		}
		err = s.repo.UpdateMinerVesting(ctx, tx, v)
		if err != nil {
			return nil, err
		}
	}
	err = s.updateStatusIfFinished(ctx, tx, deal)
	if err != nil {
		return nil, err
	}
	return deal, nil
}

func (s *service) updateStatusIfFinished(ctx context.Context, tx pgx.Tx, deal *domain.Deal) error {
	finished := true
	for _, v := range deal.MinerVestings {
		if v.Value.Cmp(v.Received) != 0 {
			finished = false
			break
		}
	}
	for _, v := range deal.GiverVestings {
		if v.Value.Cmp(v.Received) != 0 {
			finished = false
			break
		}
	}
	if finished {
		deal.Status = domain.DealStatusFinished
		if err := s.repo.UpdateDealStatus(ctx, tx, deal.ID, int(deal.Status)); err != nil {
			return err
		}
	}
	return nil
}
