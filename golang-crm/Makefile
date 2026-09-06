AIR_VERSION ?= v1.62.0
AIR_BIN := $(shell go env GOPATH)/bin/air

.PHONY: run air build test

air:
	@test -x "$(AIR_BIN)" || go install github.com/air-verse/air@$(AIR_VERSION)

run: air
	"$(AIR_BIN)" -c .air.toml
build:
	go build ./cmd
test:
	go test ./...
