package handler

import (
	"context"
	"datafimaker/models"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-openapi/strfmt"
	"github.com/gorilla/mux"
)

func (h *handler) handleGetDeals(w http.ResponseWriter, r *http.Request) {
	deals, e := h.service.GetDeals(r.Context())
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, deals)
}

func (h *handler) handleGetDealsByAddress(w http.ResponseWriter, r *http.Request) {
	addrStr := mux.Vars(r)["address"]
	if addrStr == "" {
		sendResponse(w, http.StatusBadRequest, struct{}{})
	}
	deal, e := h.service.GetDealsByAddress(r.Context(), addrStr)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, deal)
}

func (h *handler) handleCreateDeal(w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer r.Body.Close()
	}

	var req models.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("failed to parse body: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to parse body",
		})
		return
	}

	if err := req.Validate(strfmt.Default); err != nil {
		log.Println("failed to validate request: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to validate request",
			Detail:  err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	res, e := h.service.CreateDeal(ctx, req.ID)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, res)
}

func (h *handler) handleAcceptDeal(w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer r.Body.Close()
	}

	var req models.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("failed to parse body: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to parse body",
		})
		return
	}

	if err := req.Validate(strfmt.Default); err != nil {
		log.Println("failed to validate request: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to validate request",
			Detail:  err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	res, e := h.service.AcceptDeal(ctx, req.ID)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, res)
}

func (h *handler) handleCancelDeal(w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer r.Body.Close()
	}

	var req models.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("failed to parse body: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to parse body",
		})
		return
	}

	if err := req.Validate(strfmt.Default); err != nil {
		log.Println("failed to validate request: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to validate request",
			Detail:  err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	res, e := h.service.CancelDeal(ctx, req.ID)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, res)
}

func (h *handler) handleClaimDeal(w http.ResponseWriter, r *http.Request) {
	if r.Body != nil {
		defer r.Body.Close()
	}

	var req models.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("failed to parse body: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to parse body",
		})
		return
	}

	if err := req.Validate(strfmt.Default); err != nil {
		log.Println("failed to validate request: ", err)
		sendResponse(w, http.StatusBadRequest, &models.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "failed to validate request",
			Detail:  err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.cfg.RequestTimeout)
	defer cancel()

	res, e := h.service.WithdrawDeal(ctx, req.ID)
	if e != nil {
		sendResponse(w, e.Code, e)
		return
	}

	sendResponse(w, 200, res)
}
