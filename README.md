# microservices-blog-crm

## Go CRM service

The Go service lives in [`golang-crm`](./golang-crm). It follows a hexagonal layout:

- `internal/domain`: business entities and repository ports
- `internal/application`: use cases
- `internal/infrastructure`: Echo HTTP adapter and PostgreSQL/GORM adapter

Start PostgreSQL from the repository root, then run the API:

```sh
docker compose up -d db-crm
cd golang-crm
go run ./cmd
```

The service reads `golang-crm/.env` and exposes `GET http://localhost:8080/api/v1/customers` and `GET http://localhost:8080/health`.

For live reload, install [Air](https://github.com/air-verse/air), then run `make run` from `golang-crm`.
