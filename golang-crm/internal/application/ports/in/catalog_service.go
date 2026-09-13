package in

import (
	"context"

	"golang-crm/internal/domain/store/catalog"
)

type CatalogService interface {
	ListCategories(context.Context) ([]catalog.Category, error)
	ListProducts(context.Context, catalog.ProductFilter) ([]catalog.Product, int, error)
	GetProduct(context.Context, string) (*catalog.Product, error)
}
