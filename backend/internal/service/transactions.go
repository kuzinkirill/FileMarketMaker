package service

import (
	"context"
	"datafimaker/contracts/loan"
	"datafimaker/internal/domain"
	"datafimaker/models"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/jackc/pgx/v5"
)

func (s *service) getTxLogs(ctx context.Context, hash string) ([]*types.Log, error) {
	for i := 0; i < 50; i++ {
		time.Sleep(300 * time.Millisecond)
		rec, err := s.ethClient.TransactionReceipt(ctx, common.HexToHash(hash))
		if err != nil {
			log.Println("get tx logs failed", hash, err)
			continue
		}
		if rec == nil {
			continue
		}
		return rec.Logs, nil
	}
	return nil, fmt.Errorf("failed to fetch tx logs")
}

func (s *service) CreateDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse) {
	logs, err := s.getTxLogs(ctx, txId)
	if err != nil {
		log.Println("get tx logs failed", txId, err)
		return nil, internalError
	}
	var (
		requiredLog *types.Log
	)
	for _, l := range logs {
		instance, err := loan.NewProfitCollateralLoan(l.Address, nil)
		if err != nil {
			continue
		}
		_, err = instance.ParseLoanPlaced(*l)
		if err != nil {
			continue
		}
		requiredLog = l
		break
	}
	if requiredLog == nil {
		return nil, internalError
	}

	blockMapLock.Lock()
	l, ok := blockLock[requiredLog.BlockNumber]
	if !ok {
		l = &sync.Mutex{}
		blockLock[requiredLog.BlockNumber] = l
	}
	blockMapLock.Unlock()
	l.Lock()
	defer l.Unlock()

	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	exists, err := s.repo.TransactionExists(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
	if err != nil {
		log.Println("exists failed: ", requiredLog.TxHash.String(), err)
		return nil, internalError
	}
	var (
		res   *models.Deal
		deal  *domain.Deal
		miner *domain.Miner
	)
	instance, err := loan.NewProfitCollateralLoan(requiredLog.Address, nil)
	if err != nil {
		return nil, internalError
	}
	if exists {
		ev, err := instance.ParseLoanPlaced(*requiredLog)
		if err != nil {
			return nil, internalError
		}

		miner, err = s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
		if err != nil {
			log.Println("miner by actor id failed", ev.ActorId, err)
			return nil, internalError
		}
		deal, err = s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
		if err != nil {
			log.Println("get deal failed", miner.ID, ev.Id.Int64(), err)
			return nil, internalError
		}
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
		if err != nil {
			log.Println("get deal vestigns failed", deal.ID, err)
			return nil, internalError
		}
		deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	} else {
		deal, err = s.processLoanPlaced(ctx, tx, instance, requiredLog)
		if err != nil {
			log.Println("process loan placed failed", err)
			return nil, internalError
		}
		err = s.repo.InsertTransaction(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
		if err != nil {
			log.Println("insert transactions failed", strings.ToLower(requiredLog.TxHash.String()), err)
			return nil, internalError
		}
		miner, err = s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
		if err != nil {
			log.Println("miner by actor id failed", deal.MinerID, err)
			return nil, internalError
		}
	}
	res = domain.DealToModel(deal, miner)

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}
	return res, nil
}

func (s *service) AcceptDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse) {
	logs, err := s.getTxLogs(ctx, txId)
	if err != nil {
		log.Println("get tx logs failed", txId, err)
		return nil, internalError
	}
	var (
		requiredLog *types.Log
	)
	for _, l := range logs {
		instance, err := loan.NewProfitCollateralLoan(l.Address, nil)
		if err != nil {
			continue
		}
		_, err = instance.ParseLoanAccepted(*l)
		if err != nil {
			continue
		}
		requiredLog = l
		break
	}
	if requiredLog == nil {
		return nil, internalError
	}

	blockMapLock.Lock()
	l, ok := blockLock[requiredLog.BlockNumber]
	if !ok {
		l = &sync.Mutex{}
		blockLock[requiredLog.BlockNumber] = l
	}
	blockMapLock.Unlock()
	l.Lock()
	defer l.Unlock()

	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	exists, err := s.repo.TransactionExists(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
	if err != nil {
		log.Println("exists failed: ", requiredLog.TxHash.String(), err)
		return nil, internalError
	}

	var (
		res   *models.Deal
		deal  *domain.Deal
		miner *domain.Miner
	)
	instance, err := loan.NewProfitCollateralLoan(requiredLog.Address, nil)
	if err != nil {
		return nil, internalError
	}
	if exists {
		ev, err := instance.ParseLoanAccepted(*requiredLog)
		if err != nil {
			return nil, internalError
		}

		miner, err = s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
		if err != nil {
			log.Println("miner by actor id failed", ev.ActorId, err)
			return nil, internalError
		}
		deal, err = s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
		if err != nil {
			log.Println("get deal failed", miner.ID, ev.Id.Int64(), err)
			return nil, internalError
		}
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
		if err != nil {
			log.Println("get deal vestigns failed", deal.ID, err)
			return nil, internalError
		}
		deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	} else {
		deal, err = s.processLoanAccepted(ctx, tx, instance, requiredLog)
		if err != nil {
			log.Println("process loan accepted failed", err)
			return nil, internalError
		}
		err = s.repo.InsertTransaction(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
		if err != nil {
			log.Println("insert transactions failed", strings.ToLower(requiredLog.TxHash.String()), err)
			return nil, internalError
		}
		miner, err = s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
		if err != nil {
			log.Println("miner by actor id failed", deal.MinerID, err)
			return nil, internalError
		}
	}
	res = domain.DealToModel(deal, miner)

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}
	return res, nil
}

func (s *service) CancelDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse) {
	logs, err := s.getTxLogs(ctx, txId)
	if err != nil {
		log.Println("get tx logs failed", txId, err)
		return nil, internalError
	}
	var (
		requiredLog *types.Log
	)
	for _, l := range logs {
		instance, err := loan.NewProfitCollateralLoan(l.Address, nil)
		if err != nil {
			continue
		}
		_, err = instance.ParseLoanCanceled(*l)
		if err != nil {
			continue
		}
		requiredLog = l
		break
	}
	if requiredLog == nil {
		return nil, internalError
	}

	blockMapLock.Lock()
	l, ok := blockLock[requiredLog.BlockNumber]
	if !ok {
		l = &sync.Mutex{}
		blockLock[requiredLog.BlockNumber] = l
	}
	blockMapLock.Unlock()
	l.Lock()
	defer l.Unlock()

	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	exists, err := s.repo.TransactionExists(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
	if err != nil {
		log.Println("exists failed: ", requiredLog.TxHash.String(), err)
		return nil, internalError
	}
	var (
		res   *models.Deal
		deal  *domain.Deal
		miner *domain.Miner
	)
	instance, err := loan.NewProfitCollateralLoan(requiredLog.Address, nil)
	if err != nil {
		return nil, internalError
	}
	if exists {
		ev, err := instance.ParseLoanCanceled(*requiredLog)
		if err != nil {
			return nil, internalError
		}

		miner, err = s.repo.GetMinerByActorID(ctx, tx, int64(ev.ActorId))
		if err != nil {
			log.Println("miner by actor id failed", ev.ActorId, err)
			return nil, internalError
		}
		deal, err = s.repo.GetDeal(ctx, tx, miner.ID, ev.Id.Int64())
		if err != nil {
			log.Println("get deal failed", miner.ID, ev.Id.Int64(), err)
			return nil, internalError
		}
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
		if err != nil {
			log.Println("get deal vestigns failed", deal.ID, err)
			return nil, internalError
		}
		deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	} else {
		deal, err = s.processLoanCancelled(ctx, tx, instance, requiredLog)
		if err != nil {
			log.Println("process loan cancelled failed", err)
			return nil, internalError
		}
		err = s.repo.InsertTransaction(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
		if err != nil {
			log.Println("insert transactions failed", strings.ToLower(requiredLog.TxHash.String()), err)
			return nil, internalError
		}
		miner, err = s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
		if err != nil {
			log.Println("miner by actor id failed", deal.MinerID, err)
			return nil, internalError
		}
	}
	res = domain.DealToModel(deal, miner)

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}
	return res, nil
}

func (s *service) WithdrawDeal(ctx context.Context, txId string) (*models.Deal, *models.ErrorResponse) {
	logs, err := s.getTxLogs(ctx, txId)
	if err != nil {
		log.Println("get tx logs failed", txId, err)
		return nil, internalError
	}
	var (
		requiredLog *types.Log
	)
	for _, l := range logs {
		instance, err := loan.NewProfitCollateralLoan(l.Address, nil)
		if err != nil {
			continue
		}
		_, err = instance.ParseLoanGiverWithdrawn(*l)
		_, err2 := instance.ParseLoanMinerWithdrawn(*l)
		if err != nil && err2 != nil {
			continue
		}
		requiredLog = l
		break
	}
	if requiredLog == nil {
		return nil, internalError
	}

	blockMapLock.Lock()
	l, ok := blockLock[requiredLog.BlockNumber]
	if !ok {
		l = &sync.Mutex{}
		blockLock[requiredLog.BlockNumber] = l
	}
	blockMapLock.Unlock()
	l.Lock()
	defer l.Unlock()

	tx, err := s.repo.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("begin tx failed: ", err)
		return nil, internalError
	}
	defer s.repo.RollbackTx(ctx, tx)

	exists, err := s.repo.TransactionExists(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
	if err != nil {
		log.Println("exists failed: ", requiredLog.TxHash.String(), err)
		return nil, internalError
	}
	var (
		res   *models.Deal
		deal  *domain.Deal
		miner *domain.Miner
	)
	instance, err := loan.NewProfitCollateralLoan(requiredLog.Address, nil)
	if err != nil {
		return nil, internalError
	}
	ev, err := instance.ParseLoanGiverWithdrawn(*requiredLog)
	ev2, err2 := instance.ParseLoanMinerWithdrawn(*requiredLog)
	if err != nil && err2 != nil {
		return nil, internalError
	}
	if exists {
		var (
			actorId uint64
			dealId  int64
		)
		if ev != nil {
			actorId, dealId = ev.ActorId, ev.Id.Int64()
		} else {
			actorId, dealId = ev2.ActorId, ev2.Id.Int64()
		}

		miner, err = s.repo.GetMinerByActorID(ctx, tx, int64(actorId))
		if err != nil {
			log.Println("miner by actor id failed", actorId, err)
			return nil, internalError
		}
		deal, err = s.repo.GetDeal(ctx, tx, miner.ID, dealId)
		if err != nil {
			log.Println("get deal failed", miner.ID, dealId, err)
			return nil, internalError
		}
		minerVestings, giverVestings, err := s.repo.GetDealVestings(ctx, tx, deal.ID)
		if err != nil {
			log.Println("get deal vestigns failed", deal.ID, err)
			return nil, internalError
		}
		deal.MinerVestings, deal.GiverVestings = minerVestings, giverVestings
	} else {
		if ev != nil {
			deal, err = s.processLoanGiverWithdrawn(ctx, tx, instance, requiredLog)
			if err != nil {
				log.Println("process loan giver withdrawn failed", err)
				return nil, internalError
			}
		} else {
			deal, err = s.processLoanMinerWithdrawn(ctx, tx, instance, requiredLog)
			if err != nil {
				log.Println("process loan miner withdrawn failed", err)
				return nil, internalError
			}
		}
		err = s.repo.InsertTransaction(ctx, tx, strings.ToLower(requiredLog.TxHash.String()))
		if err != nil {
			log.Println("insert transactions failed", strings.ToLower(requiredLog.TxHash.String()), err)
			return nil, internalError
		}
		miner, err = s.repo.GetMinerByMinerID(ctx, tx, deal.MinerID)
		if err != nil {
			log.Println("miner by actor id failed", deal.MinerID, err)
			return nil, internalError
		}
	}
	res = domain.DealToModel(deal, miner)

	if err := s.repo.CommitTx(ctx, tx); err != nil {
		log.Println("failed to commit: ", err.Error())
		return nil, internalError
	}
	return res, nil
}
