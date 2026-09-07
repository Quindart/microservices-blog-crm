package out

import (
	"context"

	"golang-crm/internal/domain/product"
)

type ProductRepository interface {
	GetByParams(context.Context, int, int) ([]product.Product, error)
	GetByID(context.Context, int64) (*product.Product, error)
}
