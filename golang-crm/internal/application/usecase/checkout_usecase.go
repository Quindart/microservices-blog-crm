package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/checkout"
)

type CheckoutUseCase struct{ repository out.CheckoutRepository }

func NewCheckoutUseCase(repository out.CheckoutRepository) CheckoutUseCase {
	return CheckoutUseCase{repository: repository}
}

func (u CheckoutUseCase) CreateOrder(
	ctx context.Context,
	session string,
	input checkout.CreateOrderInput,
) (*checkout.Order, error) {
	return u.repository.CreateOrder(ctx, session, input)
}

func (u CheckoutUseCase) GetOrder(
	ctx context.Context,
	orderNumber string,
) (*checkout.Order, error) {
	return u.repository.GetOrder(ctx, orderNumber)
}
