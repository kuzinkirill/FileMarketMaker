package handler

import (
	"datafimaker/internal/config"
	"datafimaker/internal/service"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type Handler interface {
	Init() http.Handler
}

type handler struct {
	cfg     *config.HandlerConfig
	service service.Service
}

func New(cfg *config.HandlerConfig, service service.Service) Handler {
	return &handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *handler) Init() http.Handler {
	router := mux.NewRouter()

	router.HandleFunc("/miners/with_stats/{address}", h.handleGetMinerWithStats)
	router.HandleFunc("/miners/withdraw", h.handleMinersWithdraw)
	router.HandleFunc("/miners", h.handlerGetMiners)
	router.HandleFunc("/accounts/{address}", h.handleGetAccount)
	router.HandleFunc("/deals/create", h.handleCreateDeal)
	router.HandleFunc("/deals/accept", h.handleAcceptDeal)
	router.HandleFunc("/deals/claim", h.handleClaimDeal)
	router.HandleFunc("/deals/cancel", h.handleCancelDeal)
	router.HandleFunc("/deals/{address}", h.handleGetDealsByAddress)
	router.HandleFunc("/deals/by_id/{id}", h.handleGetDealById)
	router.HandleFunc("/deals", h.handleGetDeals)

	router.Use(h.corsMiddleware)

	return router
}

func (h *handler) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", h.cfg.SwaggerHost)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		next.ServeHTTP(w, r)
	})
}

func sendResponse(w http.ResponseWriter, code int64, res interface{}) {
	data, err := json.Marshal(res)
	if err != nil {
		log.Println("marshal response failed: ", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(int(code))
	if _, err := w.Write(data); err != nil {
		log.Println("write response failed: ", err)
		return
	}
}
