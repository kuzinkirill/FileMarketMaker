-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd
CREATE TABLE public.transactions
(
    id CHAR(66) NOT NULL PRIMARY KEY
);

ALTER TABLE public.transactions
    OWNER TO data_fi;
-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
DROP TABLE public.transactions;