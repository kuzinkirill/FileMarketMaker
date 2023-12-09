package handler

import (
	"datafimaker/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *handler) handleGetMinerWithStats(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]
	if address == "" {
		sendResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "",
		})
		return
	}

	miner, e := h.service.GetMinerWithStatsByAddress(r.Context(), address)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, miner)
}

func (h *handler) handlerGetMiners(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	if limitStr == "" || offsetStr == "" {
		sendResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "not specified limit and offset",
		})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		sendResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "",
		})
		return
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		sendResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "",
		})
		return
	}

	miners, e := h.service.GetMiners(r.Context(), limit, offset)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, miners)
}

func (h *handler) handleGetAccount(w http.ResponseWriter, r *http.Request) {
	address := mux.Vars(r)["address"]
	if address == "" {
		sendResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "",
		})
		return
	}

	miner, e := h.service.GetAccount(r.Context(), address)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, miner)
}

func (h *handler) handleMinersWithdraw(w http.ResponseWriter, r *http.Request) {
	sendResponse(w, 200, models.Deal{
		DealID:     69,
		GiverValue: "123",
		ID:         420,
		MinerValue: "1337",
		Status:     "1338",
	})
}
