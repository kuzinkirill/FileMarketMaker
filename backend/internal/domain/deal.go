package domain

import (
	"datafimaker/models"
	"math/big"
)

type DealStatus int32

const (
	DealStatusCreated DealStatus = iota*2 + 1
	DealStatusAccepted
	DealStatusFinished
	DealStatusCancelled
)

var dealStatusStr = map[DealStatus]string{
	DealStatusCreated:   "Created",
	DealStatusAccepted:  "Accepted",
	DealStatusFinished:  "Finished",
	DealStatusCancelled: "Cancelled",
}

func (s DealStatus) String() string {
	return dealStatusStr[s]
}

type Deal struct {
	ID            int64
	DealID        int64
	MinerID       int64
	Status        DealStatus
	MinerValue    *big.Int
	GiverValue    *big.Int
	Giver         string
	MinerVestings []*Vesting
	GiverVestings []*Vesting
}

func DealToModel(d *Deal, miner *Miner) *models.Deal {
	if d == nil {
		return nil
	}

	return &models.Deal{
		DealID:        d.DealID,
		GiverSchedule: MapSlice(d.GiverVestings, VestingToModel),
		GiverValue:    d.GiverValue.String(),
		ID:            d.ID,
		Giver:         d.Giver,
		Miner:         MinerToModel(miner),
		MinerSchedule: MapSlice(d.MinerVestings, VestingToModel),
		MinerValue:    d.MinerValue.String(),
		Status:        d.Status.String(),
	}
}

type Vesting struct {
	DealID      int64
	LockedUntil int64
	Value       *big.Int
	Received    *big.Int
}

func VestingToModel(v *Vesting) *models.Vesting {
	if v == nil {
		return nil
	}

	return &models.Vesting{
		LockedUntil: v.LockedUntil,
		Received:    v.Received.String(),
		Value:       v.Value.String(),
	}
}
