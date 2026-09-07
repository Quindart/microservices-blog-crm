package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/product"
)

type ProductUseCase struct{ repository out.ProductRepository }

func NewProductUseCase(r out.ProductRepository) ProductUseCase { return ProductUseCase{repository: r} }
func (u ProductUseCase) GetByParams(c context.Context, l, o int) ([]product.Product, error) {
	return u.repository.GetByParams(c, l, o)
}

func (u ProductUseCase) GetByID(c context.Context, id int64) (*product.Product, error) {
	return u.repository.GetByID(c, id)
}
