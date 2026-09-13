package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/cart"
)

type CartUseCase struct{ repository out.CartRepository }

func NewCartUseCase(repository out.CartRepository) CartUseCase {
	return CartUseCase{repository: repository}
}

func (u CartUseCase) GetCart(ctx context.Context, session string) (*cart.Cart, error) {
	return u.repository.GetCart(ctx, session)
}

func (u CartUseCase) AddCartItem(
	ctx context.Context,
	session, variantID string,
	quantity int,
) (*cart.Cart, error) {
	return u.repository.AddCartItem(ctx, session, variantID, quantity)
}

func (u CartUseCase) UpdateCartItem(
	ctx context.Context,
	session, itemID string,
	quantity int,
) (*cart.Cart, error) {
	return u.repository.UpdateCartItem(ctx, session, itemID, quantity)
}

func (u CartUseCase) DeleteCartItem(
	ctx context.Context,
	session, itemID string,
) error {
	return u.repository.DeleteCartItem(ctx, session, itemID)
}
