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
	"github.com/redis/go-redis/v9"
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

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
	})

	repo := repository.NewPostgresRepository(pool, rdb)
	service := service.New(cfg.Service, repo)
	handler := handler.New(cfg.Handler, service).Init()
	server := server.NewServer(cfg.Server, handler)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	log.Printf("server is listening on port %d\n", cfg.Server.Port)

	go func() {
		if err := service.ListenBlockchain(); err != nil {
			log.Fatalf("ListenBlockchain failed: %s", err.Error())
		}
		quit <- syscall.SIGTERM
	}()

	<-quit

	service.Shutdown()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}

	pool.Close()
}
