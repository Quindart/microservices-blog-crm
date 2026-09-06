.PHONY: run air build test

run:
	$(MAKE) -C golang-crm run

build:
	$(MAKE) -C golang-crm build

test:
	$(MAKE) -C golang-crm test
