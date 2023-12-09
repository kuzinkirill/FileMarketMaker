package domain

import (
	"datafimaker/models"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

type Miner struct {
	ID                 int64
	Address            common.Address
	OwnerAddress       common.Address
	WorkerAddress      common.Address
	BeneficiaryAddress common.Address
	CreationTimestamp  int64
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
		Address:            m.Address.String(),
		BeneficiaryAddress: m.BeneficiaryAddress.String(),
		CreationTimestamp:  m.CreationTimestamp,
		ID:                 m.ID,
		OwnerAddress:       m.OwnerAddress.String(),
		WorkerAddress:      m.WorkerAddress.String(),
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
