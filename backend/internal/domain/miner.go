package domain

import (
	"datafimaker/models"
	"math/big"
)

type Miner struct {
	ID                  int64
	ActorID             int64
	Address             string
	AvailableBalance    *big.Int
	OwnerAddress        string
	WorkerAddress       string
	BeneficiaryOwner    string
	BeneficiaryContract string
	LoanContract        string
	CreationTimestamp   int64
}

type MinerStats struct {
	MinerID       int64
	LockedRewards *big.Int
	BlocksMined   int64
	Rewards       *big.Int
}

func MinerToModel(m *Miner) *models.Miner {
	if m == nil {
		return nil
	}
	return &models.Miner{
		ActorID:             0,
		Address:             m.Address,
		AvailableBalance:    m.AvailableBalance.String(),
		BeneficiaryContract: m.BeneficiaryContract,
		BeneficiaryOwner:    m.BeneficiaryOwner,
		CreationTimestamp:   m.CreationTimestamp,
		LoanContract:        m.LoanContract,
		OwnerAddress:        m.OwnerAddress,
		WorkerAddress:       m.WorkerAddress,
	}
}

func MinerStatsToModel(s *MinerStats) *models.MinerStats {
	if s == nil {
		return nil
	}
	return &models.MinerStats{
		BlocksMined:   s.BlocksMined,
		LockedRewards: s.LockedRewards.String(),
		Rewards:       s.Rewards.String(),
	}
}
