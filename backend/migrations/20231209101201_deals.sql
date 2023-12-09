-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
CREATE TABLE public.deals
(
    id            BIGSERIAL    NOT NULL PRIMARY KEY,
    deal_id       BIGINT       NOT NULL,
    miner_id      BIGINT       NOT NULL,
    status        SMALLINT     NOT NULL,
    miner_value   VARCHAR(255) NOT NULL,
    giver_value   VARCHAR(255) NOT NULL,
    giver_address CHAR(42)     NULL
);
ALTER TABLE public.deals
    OWNER TO data_fi;

CREATE TABLE public.giver_vestings
(
    deal_id      BIGINT       NOT NULL,
    locked_until BIGINT       NOT NULL,
    value        VARCHAR(255) NOT NULL,
    received     VARCHAR(255) NOT NULL
);
ALTER TABLE public.giver_vestings
    OWNER TO data_fi;

CREATE TABLE public.miner_vestings
(
    deal_id      BIGINT       NOT NULL,
    locked_until BIGINT       NOT NULL,
    value        VARCHAR(255) NOT NULL,
    received     VARCHAR(255) NOT NULL
);
ALTER TABLE public.miner_vestings
    OWNER TO data_fi;

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
DROP TABLE deals;
DROP TABLE miner_vestings;
DROP TABLE giver_vestings;
