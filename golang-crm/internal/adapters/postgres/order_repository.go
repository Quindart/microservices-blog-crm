package postgres

import (
	"context"
	"time"

	"golang-crm/internal/domain/order"
	"gorm.io/gorm"
)

type orderModel struct {
	ID            int64 `gorm:"primaryKey"`
	CustomerID    string
	OrderDate     time.Time
	Status        string
	ShippingFee   float64
	PaymentMethod string
}

func (orderModel) TableName() string { return "orders" }

type orderDetailModel struct {
	OrderID   int64 `gorm:"primaryKey"`
	ProductID int64 `gorm:"primaryKey"`
	Quantity  int
	UnitPrice float64
	Discount  float64
}

func (orderDetailModel) TableName() string { return "order_details" }

type OrderRepository struct{ db *gorm.DB }

func NewOrderRepository(db *gorm.DB) OrderRepository { return OrderRepository{db: db} }
func (r OrderRepository) GetByParams(c context.Context, l, o int) ([]order.Order, error) {
	var rows []orderModel
	q := r.db.WithContext(c).Order("id")
	if l > 0 {
		q = q.Limit(l)
	}
	if o > 0 {
		q = q.Offset(o)
	}
	if err := q.Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]order.Order, len(rows))
	for i, v := range rows {
		out[i] = toOrder(v)
	}
	return out, nil
}

func (r OrderRepository) GetByID(c context.Context, id string) (*order.Order, error) {
	var v orderModel
	if err := r.db.WithContext(c).First(&v, "id = ?", id).Error; err != nil {
		return nil, err
	}
	var details []orderDetailModel
	if err := r.db.WithContext(c).Where("order_id = ?", v.ID).Find(&details).Error; err != nil {
		return nil, err
	}
	result := toOrder(v)
	result.Items = make([]order.Item, len(details))
	for i, d := range details {
		result.Items[i] = order.Item{ProductID: d.ProductID, Quantity: d.Quantity, UnitPrice: d.UnitPrice, Discount: d.Discount}
	}
	return &result, nil
}

func (r OrderRepository) GetByCustomerID(c context.Context, customerID string) ([]order.Order, error) {
	var rows []orderModel
	q := r.db.WithContext(c).Where("customer_id = ?", customerID).Order("id")
	if err := q.Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]order.Order, len(rows))
	for i, v := range rows {
		out[i] = toOrder(v)
	}
	return out, nil
}

func toOrder(v orderModel) order.Order {
	return order.Order{ID: v.ID, CustomerID: v.CustomerID, OrderDate: v.OrderDate.Format(time.RFC3339), Status: v.Status, ShippingFee: v.ShippingFee, PaymentMethod: v.PaymentMethod}
}
