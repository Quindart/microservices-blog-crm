package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/catalog"
)

type CatalogUseCase struct{ repository out.CatalogRepository }

func NewCatalogUseCase(repository out.CatalogRepository) CatalogUseCase {
	return CatalogUseCase{repository: repository}
}

func (u CatalogUseCase) ListCategories(ctx context.Context) ([]catalog.Category, error) {
	return u.repository.ListCategories(ctx)
}

func (u CatalogUseCase) ListProducts(
	ctx context.Context,
	filter catalog.ProductFilter,
) ([]catalog.Product, int, error) {
	return u.repository.ListProducts(ctx, filter)
}

func (u CatalogUseCase) GetProduct(ctx context.Context, slug string) (*catalog.Product, error) {
	return u.repository.GetProduct(ctx, slug)
}
