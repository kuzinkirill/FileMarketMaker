-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
ALTER TABLE public.miners ALTER COLUMN  address              TYPE VARCHAR(255);
ALTER TABLE public.miners ALTER COLUMN  owner_address        TYPE VARCHAR(255);
ALTER TABLE public.miners ALTER COLUMN  worker_address       TYPE VARCHAR(255);
ALTER TABLE public.miners ALTER COLUMN  beneficiary_owner    TYPE VARCHAR(255);
ALTER TABLE public.miners ALTER COLUMN  beneficiary_contract TYPE VARCHAR(255);

ALTER TABLE public.deals ALTER COLUMN giver_address TYPE VARCHAR(255);

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
ALTER TABLE public.miners ALTER COLUMN  address              TYPE CHAR(42);
ALTER TABLE public.miners ALTER COLUMN  owner_address        TYPE CHAR(42);
ALTER TABLE public.miners ALTER COLUMN  worker_address       TYPE CHAR(42);
ALTER TABLE public.miners ALTER COLUMN  beneficiary_owner    TYPE CHAR(42);
ALTER TABLE public.miners ALTER COLUMN  beneficiary_contract TYPE CHAR(42);

ALTER TABLE public.deals ALTER COLUMN giver_address TYPE CHAR(42);
