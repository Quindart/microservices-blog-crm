# Customer Handler Flow

Tài liệu này mô tả flow xử lý Customer CRUD và cách các layer kết nối với nhau trong CRM API.

## 1. Tổng quan kiến trúc

```text
HTTP Request
    ↓
Echo Router / HTTP Handler
    ↓
Input Port: CustomerService
    ↓
Application Service
    ↓
Output Port: CustomerRepository
    ↓
PostgreSQL Adapter
    ↓
Database
```

Dependency hướng vào bên trong:

```text
Domain ← Application ← Adapters ← Container
```

Domain không biết HTTP, Echo, GORM hoặc PostgreSQL.

## 2. Dependency injection

`cmd/main.go` tạo application thông qua `internal/container`.

Container thực hiện việc lắp ráp các dependency:

```text
Database
  → CustomerRepository
    → CustomerService
      → HTTP Server
```

Ví dụ:

```go
repository := postgres.NewCustomerRepository(database)
customerService := service.NewCustomerService(repository)

server := http.NewServer(cfg.Port, http.Dependencies{
    CustomerService: customerService,
})
```

HTTP server chỉ nhận input port, không phụ thuộc trực tiếp vào PostgreSQL implementation.

## 3. HTTP routes

| Method | Endpoint | Handler | Mục đích |
|---|---|---|---|
| `GET` | `/api/v1/customers` | `list` | Lấy danh sách customer |
| `POST` | `/api/v1/customers` | `create` | Tạo customer |
| `GET` | `/api/v1/customers/:id` | `getByID` | Lấy customer theo ID |
| `PUT` | `/api/v1/customers/:id` | `update` | Cập nhật customer |
| `DELETE` | `/api/v1/customers/:id` | `delete` | Xóa customer |

Các route được đăng ký trong `internal/adapters/http/server.go`.

## 4. DTO layer

HTTP request và response model nằm trong:

```text
internal/adapters/http/dto/
├── customer_request.go
└── customer_response.go
```

DTO chỉ mô tả contract của REST API. DTO không được truyền vào domain hoặc application service.

Các DTO hiện tại:

- `CreateCustomerRequest`: body của request tạo customer.
- `UpdateCustomerRequest`: body của request cập nhật customer.
- `CustomerResponse`: response trả về cho client.

Handler chịu trách nhiệm mapping giữa DTO và domain model.

## 5. Flow GET danh sách

Request:

```http
GET /api/v1/customers
```

Flow:

1. Echo gọi handler `list`.
2. Handler lấy request context.
3. Handler gọi `CustomerService.List(ctx)`.
4. Application service gọi `CustomerRepository.List(ctx)`.
5. PostgreSQL adapter truy vấn bảng `customers` bằng GORM.
6. Database model được map thành `customer.Customer`.
7. Handler map domain model thành `dto.CustomerResponse`.
8. API trả `200 OK` cùng JSON response.

## 6. Flow POST tạo customer

Request:

```http
POST /api/v1/customers
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "city": "Hanoi"
}
```

Flow:

1. Handler bind JSON vào `CreateCustomerRequest`.
2. Handler kiểm tra các field bắt buộc.
3. Handler tạo domain object bằng `customer.New(...)`.
4. Domain tạo ID cho customer.
5. Handler gọi `CustomerService.Create(ctx, customer)`.
6. Application service gọi output port `CustomerRepository.Create`.
7. PostgreSQL adapter map domain object sang database model.
8. Repository insert record vào PostgreSQL.
9. Handler trả response với status `201 Created`.

## 7. Flow GET theo ID

Request:

```http
GET /api/v1/customers/{id}
```

1. Handler lấy ID từ URL parameter.
2. Handler gọi `CustomerService.GetByID`.
3. Repository tìm record trong database.
4. Nếu tìm thấy, record được trả về qua các layer.
5. Nếu không tìm thấy, PostgreSQL adapter chuyển `gorm.ErrRecordNotFound` thành `customer.ErrNotFound`.
6. Handler chuyển lỗi domain thành `404 Not Found`.

Các kết quả chính:

- Thành công: `200 OK`.
- Không tìm thấy: `404 Not Found`.
- Lỗi không xác định: `500 Internal Server Error`.

## 8. Flow PUT cập nhật

Request:

```http
PUT /api/v1/customers/{id}
Content-Type: application/json
```

1. Handler bind body vào `UpdateCustomerRequest`.
2. Handler validate dữ liệu.
3. Handler lấy ID từ URL và tạo domain object.
4. Application service gọi `CustomerRepository.Update`.
5. Repository cập nhật record theo ID.
6. Nếu không có record, repository trả `customer.ErrNotFound`.
7. Nếu thành công, repository lấy lại record mới nhất.
8. Handler trả `200 OK`.

## 9. Flow DELETE

Request:

```http
DELETE /api/v1/customers/{id}
```

1. Handler lấy ID từ URL.
2. Handler gọi `CustomerService.Delete`.
3. Repository xóa record trong PostgreSQL.
4. Nếu không có record bị xóa, trả `customer.ErrNotFound`.
5. Handler trả `204 No Content` nếu thành công.

## 10. Trách nhiệm của từng layer

### Domain

Nằm trong `internal/domain/customer`.

- Chứa `customer.Customer`.
- Chứa lỗi nghiệp vụ như `customer.ErrNotFound`.
- Tạo domain object bằng `customer.New`.
- Không phụ thuộc framework hoặc database.

### Application

Nằm trong `internal/application`.

- `ports/in`: interface mà inbound adapter gọi.
- `ports/out`: interface mà application cần từ infrastructure.
- `service`: thực thi use case và business rules.

### Inbound HTTP adapter

Nằm trong `internal/adapters/http`.

- Đăng ký route.
- Parse request.
- Validate input cơ bản.
- Gọi input port.
- Map lỗi thành HTTP status.
- Map domain model thành response DTO.

### Outbound PostgreSQL adapter

Nằm trong `internal/adapters/postgres`.

- Truy cập PostgreSQL thông qua GORM.
- Map database model và domain model.
- Chuyển lỗi GORM thành lỗi domain.

### Container

Nằm trong `internal/container`.

- Khởi tạo infrastructure.
- Tạo repository và application service.
- Inject dependency vào HTTP server.
- Quản lý lifecycle của database.

## 11. Nguyên tắc mở rộng

Khi thêm service mới, ví dụ `OrderService`:

1. Tạo input port trong `application/ports/in`.
2. Tạo output port cần thiết trong `application/ports/out`.
3. Tạo implementation trong `application/service`.
4. Thêm adapter tương ứng nếu cần.
5. Thêm dependency vào `http.Dependencies`.
6. Wire dependency trong `container.New`.

Server constructor không cần nhận thêm nhiều tham số rời rạc; chỉ cần mở rộng `Dependencies`.
