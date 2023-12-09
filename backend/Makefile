run:
	go run cmd/app/main.go -cfg configs/local

build-models:
	docker run --rm --user $(shell id -u):$(shell id -g) -e GOPATH=$(go env GOPATH):/go -v ${HOME}:${HOME} -w $(shell pwd) quay.io/goswagger/swagger generate model --spec=./swagger.yaml
	go mod tidy

build-contracts:
	mkdir -p contracts/build
	(cd ../contracts && yarn && yarn hardhat compile && cp -r artifacts/contracts/* ../backend/contracts/build)
	mkdir -p contracts/loan
	jq ".abi" contracts/build/ProfitCollateralLoan.sol/ProfitCollateralLoan.json > contracts/build/ProfitCollateralLoan.sol/ProfitCollateralLoan.abi
	abigen --abi contracts/build/ProfitCollateralLoan.sol/ProfitCollateralLoan.abi \
		--pkg loan \
		--type ProfitCollateralLoan \
		--out contracts/loan/loan.go

postgres.start:
	if [ ! "$(shell docker ps -q -f name=data-fi-postgres)" ]; then \
        if [ "$(shell docker ps -aq -f status=exited -f name=data-fi-postgres)" ]; then \
            docker rm data-fi-postgres; \
        fi; \
		docker run --restart unless-stopped -d -p 1348:5432 -e POSTGRES_PASSWORD=1337 --name data-fi-postgres postgres:16; \
        sleep 5; \
    fi;
	docker exec data-fi-postgres psql -U postgres -c "create user data_fi password '1337'"
	docker exec data-fi-postgres psql -U postgres -c "create database data_fi"
	docker exec data-fi-postgres psql -U postgres -c "grant all privileges on database data_fi to data_fi"
	docker exec data-fi-postgres psql -U postgres -c "alter database data_fi owner to data_fi"
	docker exec data-fi-postgres psql -U postgres -c "grant usage, create on schema public to data_fi"

migrate.up:
	goose -dir migrations postgres "host=localhost port=1348 user=data_fi password=1337 dbname=data_fi sslmode=disable" up

migrate.down:
	goose -dir migrations postgres "host=localhost port=1348 user=data_fi password=1337 dbname=data_fi sslmode=disable" down

migrate.status:
	goose -dir migrations  postgres "host=localhost port=1348 user=data_fi password=1337 dbname=data_fi sslmode=disable" status

swagger.start:
	cp swagger.yaml
	docker run --restart unless-stopped -d --name data-fi-swagger -p 9201:8080 -e SWAGGER_JSON=/swagger.yaml -v $(shell pwd)/swagger.yaml:/swagger.yaml swaggerapi/swagger-ui

swagger.stop:
	docker stop data-fi-swagger
	docker rm data-fi-swagger
