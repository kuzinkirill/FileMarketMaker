package repository

import (
	"context"
	"github.com/cockroachdb/errors"
	"github.com/jackc/pgx/v5"
)

func (r *postgresRepository) TransactionExists(ctx context.Context, tx pgx.Tx, id string) (bool, error) {
	query := `SELECT id FROM transactions WHERE id=$1`
	if err := tx.QueryRow(ctx, query, id).Scan(&id); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *postgresRepository) InsertTransaction(ctx context.Context, tx pgx.Tx, id string) error {
	query := `INSERT INTO transactions VALUES ($1)`
	if _, err := tx.Exec(ctx, query, id); err != nil {
		return err
	}
	return nil
}
