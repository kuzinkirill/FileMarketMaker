-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
CREATE TABLE public.miners(
    id                  BIGSERIAL NOT NULL PRIMARY KEY,
    address             CHAR(42)  NOT NULL,
    owner_address       CHAR(42)  NOT NULL,
    worker_address      CHAR(42)  NOT NULL,
    beneficiary_address CHAR(42)  NOT NULL,
    creation_timestamp  BIGINT    NOT NULL,

    UNIQUE (address)
);
ALTER TABLE public.miners OWNER TO data_fi;

CREATE TABLE public.miner_last_year_stats(
    miner_id      BIGINT       NOT NULL PRIMARY KEY,
    locked_reward VARCHAR(256) NOT NULL,
    blocks_mined  BIGINT       NOT NULL,
    rewards       VARCHAR(256) NOT NULL
);
ALTER TABLE public.miner_last_year_stats OWNER TO data_fi;

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
DROP TABLE miners;
DROP TABLE miner_last_year_stats;
