package postgres

import (
	"context"
	"errors"
	"fmt"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/cart"
	"gorm.io/gorm"
)

const cartCurrency = "VND"
const cartShippingFee = 120000

type CartRepository struct{ db *gorm.DB }

func NewCartRepository(db *gorm.DB) CartRepository {
	return CartRepository{db: db}
}

func (r CartRepository) GetCart(ctx context.Context, session string) (*cart.Cart, error) {
	dbCart, err := r.findOrCreateCart(ctx, session)
	if err != nil {
		return nil, err
	}
	var rows []models.CartItem
	if err := r.db.WithContext(ctx).
		Where("cart_id = ?", dbCart.ID).
		Find(&rows).Error; err != nil {
		return nil, err
	}

	result := &cart.Cart{
		Items:   []cart.CartItem{},
		Summary: cart.Summary{Currency: cartCurrency},
	}
	for _, row := range rows {
		var variant models.CatalogVariant
		if err := r.db.WithContext(ctx).
			First(&variant, "id = ?", row.VariantID).Error; err != nil {
			return nil, err
		}
		var product models.CatalogProduct
		if err := r.db.WithContext(ctx).
			First(&product, "id = ?", variant.ProductID).Error; err != nil {
			return nil, err
		}
		item := cart.CartItem{
			ID: row.ID, ProductID: product.ID, VariantID: variant.ID,
			Name: product.Name, VariantName: variant.Name,
			UnitPrice: variant.Price, Quantity: row.Quantity,
			TotalPrice: variant.Price * float64(row.Quantity),
		}
		result.Items = append(result.Items, item)
		result.Summary.Subtotal += item.TotalPrice
	}
	if result.Summary.Subtotal > 0 {
		result.Summary.ShippingFee = cartShippingFee
	}
	result.Summary.Total = result.Summary.Subtotal + result.Summary.ShippingFee
	return result, nil
}

func (r CartRepository) AddCartItem(
	ctx context.Context,
	session, variantID string,
	quantity int,
) (*cart.Cart, error) {
	if quantity < 1 {
		return nil, fmt.Errorf("quantity must be positive")
	}
	var variant models.CatalogVariant
	if err := r.db.WithContext(ctx).
		Where("id = ? AND is_active = ?", variantID, true).
		First(&variant).Error; err != nil {
		return nil, err
	}
	dbCart, err := r.findOrCreateCart(ctx, session)
	if err != nil {
		return nil, err
	}
	var item models.CartItem
	result := r.db.WithContext(ctx).
		Where("cart_id = ? AND variant_id = ?", dbCart.ID, variantID).
		First(&item)
	switch {
	case result.Error == nil:
		item.Quantity += quantity
		err = r.db.WithContext(ctx).Save(&item).Error
	case errors.Is(result.Error, gorm.ErrRecordNotFound):
		item = models.CartItem{
			ID: newID(), CartID: dbCart.ID, VariantID: variantID, Quantity: quantity,
		}
		err = r.db.WithContext(ctx).Create(&item).Error
	default:
		err = result.Error
	}
	if err != nil {
		return nil, err
	}
	return r.GetCart(ctx, session)
}

func (r CartRepository) UpdateCartItem(
	ctx context.Context,
	session, itemID string,
	quantity int,
) (*cart.Cart, error) {
	dbCart, err := r.findOrCreateCart(ctx, session)
	if err != nil {
		return nil, err
	}
	if quantity < 1 {
		return r.GetCart(ctx, session)
	}
	if result := r.db.WithContext(ctx).
		Model(&models.CartItem{}).
		Where("id = ? AND cart_id = ?", itemID, dbCart.ID).
		Update("quantity", quantity); result.Error != nil {
		return nil, result.Error
	}
	return r.GetCart(ctx, session)
}

func (r CartRepository) DeleteCartItem(
	ctx context.Context,
	session, itemID string,
) error {
	dbCart, err := r.findOrCreateCart(ctx, session)
	if err != nil {
		return err
	}
	return r.db.WithContext(ctx).
		Where("id = ? AND cart_id = ?", itemID, dbCart.ID).
		Delete(&models.CartItem{}).Error
}

func (r CartRepository) findOrCreateCart(
	ctx context.Context,
	session string,
) (*models.Cart, error) {
	var dbCart models.Cart
	result := r.db.WithContext(ctx).
		Where("session_id = ?", session).
		First(&dbCart)
	if result.Error == nil {
		return &dbCart, nil
	}
	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}
	dbCart = models.Cart{ID: newID(), SessionID: session}
	if err := r.db.WithContext(ctx).Create(&dbCart).Error; err != nil {
		return nil, err
	}
	return &dbCart, nil
}
