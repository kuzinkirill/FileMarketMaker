-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
ALTER TABLE public.miners ALTER COLUMN available_balance TYPE VARCHAR(255);

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
ALTER TABLE public.miners ALTER COLUMN available_balance TYPE CHAR(255);
