package main

import (
	"context"
	"datafimaker/internal/config"
	"datafimaker/internal/handler"
	"datafimaker/internal/repository"
	"datafimaker/internal/server"
	"datafimaker/internal/service"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	log.SetFlags(log.Ldate | log.Ltime | log.Llongfile)

	var cfgPath string
	flag.StringVar(&cfgPath, "cfg", "configs/local", "config path")
	flag.Parse()

	ctx := context.Background()
	cfg, err := config.Init(cfgPath)
	if err != nil {
		log.Fatal(err)
	}

	pool, err := pgxpool.New(ctx, cfg.Postgres.PgSource())
	if err != nil {
		log.Fatal(err)
	}
	if err := pool.Ping(ctx); err != nil {
		log.Fatal(err)
	}

	repo := repository.NewPostgresRepository(pool)
	service := service.New(repo)
	handler := handler.New(cfg.Handler, service).Init()
	server := server.NewServer(cfg.Server, handler)

	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	<-quit

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}

	pool.Close()
}
