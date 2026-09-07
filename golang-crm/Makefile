AIR_VERSION ?= v1.62.0
AIR_BIN := $(shell go env GOPATH)/bin/air
GOFUMPT_BIN := $(shell go env GOPATH)/bin/gofumpt
LINE_LENGTH ?= 100

.PHONY: run air build test fmt format format-check line-length-check vet

air:
	@test -x "$(AIR_BIN)" || go install github.com/air-verse/air@$(AIR_VERSION)

run: air
	"$(AIR_BIN)" -c .air.toml
build:
	go build ./cmd
test:
	go test ./...

# Format all Go source files in the repository with gofumpt.
fmt format:
	@test -x "$(GOFUMPT_BIN)" || { echo "gofumpt is not installed. Run: go install mvdan.cc/gofumpt@latest"; exit 1; }
	"$(GOFUMPT_BIN)" -w $$(find . -type f -name '*.go' -not -path './vendor/*')

# Fail when any Go file is not gofumpt-compliant. Useful in CI.
format-check: line-length-check
	@test -x "$(GOFUMPT_BIN)" || { echo "gofumpt is not installed. Run: go install mvdan.cc/gofumpt@latest"; exit 1; }
	@test -z $$($(GOFUMPT_BIN) -l $$(find . -type f -name '*.go' -not -path './vendor/*')) || { echo 'Go files need formatting:'; $(GOFUMPT_BIN) -l $$(find . -type f -name '*.go' -not -path './vendor/*'); exit 1; }

# Fail when a Go source line exceeds the configured maximum length.
line-length-check:
	@files=$$(find . -type f -name '*.go' -not -path './vendor/*'); \
	awk -v max=$(LINE_LENGTH) 'length($$0) > max { print FILENAME ":" FNR ":" length($$0) " characters"; found=1 } END { exit found }' $$files

vet:
	go vet ./...
