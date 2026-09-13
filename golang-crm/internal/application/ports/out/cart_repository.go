package out

import (
	"context"

	"golang-crm/internal/domain/store/cart"
)

type CartRepository interface {
	GetCart(context.Context, string) (*cart.Cart, error)
	AddCartItem(context.Context, string, string, int) (*cart.Cart, error)
	UpdateCartItem(context.Context, string, string, int) (*cart.Cart, error)
	DeleteCartItem(context.Context, string, string) error
}
