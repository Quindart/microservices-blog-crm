package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/checkout"
	"gorm.io/gorm"
)

type CheckoutRepository struct{ db *gorm.DB }

func NewCheckoutRepository(db *gorm.DB) CheckoutRepository {
	return CheckoutRepository{db: db}
}

func (r CheckoutRepository) CreateOrder(
	ctx context.Context,
	session string,
	input checkout.CreateOrderInput,
) (*checkout.Order, error) {
	var orderNumber string
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var dbCart models.Cart
		if err := tx.Where("session_id = ?", session).First(&dbCart).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("cart is empty")
			}
			return err
		}
		var cartItems []models.CartItem
		if err := tx.Where("cart_id = ?", dbCart.ID).Find(&cartItems).Error; err != nil {
			return err
		}
		if len(cartItems) == 0 {
			return fmt.Errorf("cart is empty")
		}

		order := &models.CheckoutOrder{
			ID: newID(), OrderNumber: fmt.Sprintf("ORD-%d", time.Now().UnixNano()),
			Status: "PENDING", Currency: cartCurrency,
			CustomerName: input.CustomerName, CustomerEmail: input.CustomerEmail,
			ShippingAddress: marshalAddress(input.ShippingAddress),
		}
		items := make([]models.CheckoutOrderItem, 0, len(cartItems))
		for _, cartItem := range cartItems {
			var variant models.CatalogVariant
			if err := tx.Where("id = ? AND is_active = ?", cartItem.VariantID, true).
				First(&variant).Error; err != nil {
				return fmt.Errorf("variant %s is unavailable: %w", cartItem.VariantID, err)
			}
			result := tx.Model(&models.CatalogVariant{}).
				Where("id = ? AND stock >= ?", variant.ID, cartItem.Quantity).
				UpdateColumn("stock", gorm.Expr("stock - ?", cartItem.Quantity))
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected != 1 {
				return fmt.Errorf("variant %s is unavailable", variant.ID)
			}
			var product models.CatalogProduct
			if err := tx.First(&product, "id = ?", variant.ProductID).Error; err != nil {
				return err
			}
			lineTotal := variant.Price * float64(cartItem.Quantity)
			order.Subtotal += lineTotal
			items = append(items, models.CheckoutOrderItem{
				ID: newID(), OrderID: order.ID, VariantID: variant.ID,
				ProductName: product.Name, VariantName: variant.Name, SKU: variant.SKU,
				UnitPrice: variant.Price, Quantity: cartItem.Quantity, TotalPrice: lineTotal,
			})
		}
		if order.Subtotal > 0 {
			order.ShippingFee = cartShippingFee
		}
		order.Total = order.Subtotal + order.ShippingFee
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}
		if err := tx.Where("cart_id = ?", dbCart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}
		orderNumber = order.OrderNumber
		return nil
	})
	if err != nil {
		return nil, err
	}
	return r.GetOrder(ctx, orderNumber)
}

func (r CheckoutRepository) GetOrder(
	ctx context.Context,
	orderNumber string,
) (*checkout.Order, error) {
	var row models.CheckoutOrder
	if err := r.db.WithContext(ctx).
		Where("order_number = ?", orderNumber).
		First(&row).Error; err != nil {
		return nil, err
	}
	result := checkout.Order{
		ID: row.ID, OrderNumber: row.OrderNumber, Status: row.Status,
		Subtotal: row.Subtotal, ShippingFee: row.ShippingFee, Discount: row.Discount,
		Total: row.Total, Currency: row.Currency, CustomerName: row.CustomerName,
		CustomerEmail: row.CustomerEmail, CreatedAt: row.CreatedAt, Items: []checkout.OrderItem{},
	}
	if err := json.Unmarshal(row.ShippingAddress, &result.ShippingAddress); err != nil {
		return nil, fmt.Errorf("decode shipping address: %w", err)
	}
	var rows []models.CheckoutOrderItem
	if err := r.db.WithContext(ctx).
		Where("order_id = ?", row.ID).
		Find(&rows).Error; err != nil {
		return nil, err
	}
	for _, item := range rows {
		result.Items = append(result.Items, checkout.OrderItem{
			ID: item.ID, ProductName: item.ProductName, VariantName: item.VariantName,
			SKU: item.SKU, UnitPrice: item.UnitPrice, Quantity: item.Quantity,
			TotalPrice: item.TotalPrice,
		})
	}
	return &result, nil
}

func marshalAddress(address checkout.Address) []byte {
	data, _ := json.Marshal(address)
	return data
}
