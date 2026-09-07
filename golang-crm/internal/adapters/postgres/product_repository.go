package postgres

import (
	"context"

	"golang-crm/internal/domain/product"
	"gorm.io/gorm"
)

type productModel struct {
	ID           int64 `gorm:"primaryKey"`
	Name         string
	Category     string
	UnitPrice    float64
	Cost         float64
	Discontinued bool
	Stock        int
}

func (productModel) TableName() string { return "products" }

type ProductRepository struct{ db *gorm.DB }

func NewProductRepository(db *gorm.DB) ProductRepository { return ProductRepository{db: db} }
func (r ProductRepository) GetByParams(c context.Context, l, o int) ([]product.Product, error) {
	var rows []productModel
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
	out := make([]product.Product, len(rows))
	for i, v := range rows {
		out[i] = toProduct(v)
	}
	return out, nil
}

func (r ProductRepository) GetByID(c context.Context, id int64) (*product.Product, error) {
	var v productModel
	if err := r.db.WithContext(c).First(&v, "id = ?", id).Error; err != nil {
		return nil, err
	}
	p := toProduct(v)
	return &p, nil
}

func toProduct(v productModel) product.Product {
	return product.Product{ID: v.ID, Name: v.Name, Category: v.Category, UnitPrice: v.UnitPrice, Cost: v.Cost, Discontinued: v.Discontinued, Stock: v.Stock}
}
