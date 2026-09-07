package postgres

import (
	"context"

	"golang-crm/internal/domain/customer"

	"gorm.io/gorm"
)

type customerModel struct {
	ID    string `gorm:"type:uuid;primaryKey"`
	Name  string
	Email string `gorm:"uniqueIndex"`
	City  string
}

func (customerModel) TableName() string { return "customers" }

type CustomerRepository struct{ db *gorm.DB }

func NewCustomerRepository(db *gorm.DB) CustomerRepository {
	return CustomerRepository{db: db}
}

func (r CustomerRepository) List(ctx context.Context) ([]customer.Customer, error) {
	return r.ListByParams(ctx, 0, 0)
}

func (r CustomerRepository) ListByParams(ctx context.Context, limit, offset int) ([]customer.Customer, error) {
	var rows []customerModel
	query := r.db.WithContext(ctx).Order("id")
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}
	if err := query.Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]customer.Customer, len(rows))
	for i, row := range rows {
		out[i] = customer.Customer{ID: row.ID, Name: row.Name, Email: row.Email, City: row.City}
	}
	return out, nil
}

func (r CustomerRepository) GetByID(ctx context.Context, id string) (*customer.Customer, error) {
	var row customerModel
	result := r.db.WithContext(ctx).First(&row, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	item := customer.Customer{ID: row.ID, Name: row.Name, Email: row.Email, City: row.City}
	return &item, nil
}

func (r CustomerRepository) Create(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	row := customerModel{ID: item.ID, Name: item.Name, Email: item.Email, City: item.City}
	if err := r.db.WithContext(ctx).Create(&row).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r CustomerRepository) Update(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	result := r.db.WithContext(ctx).Model(&customerModel{}).Where("id = ?", item.ID).
		Updates(map[string]interface{}{"name": item.Name, "email": item.Email, "city": item.City})
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return r.GetByID(ctx, item.ID)
}

func (r CustomerRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&customerModel{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
