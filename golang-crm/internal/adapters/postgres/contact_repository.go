package postgres

import (
	"context"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/contact"
	"gorm.io/gorm"
)

type ContactRepository struct{ db *gorm.DB }

func NewContactRepository(db *gorm.DB) ContactRepository {
	return ContactRepository{db: db}
}

func (r ContactRepository) CreateContact(
	ctx context.Context,
	item contact.Contact,
) (*contact.Contact, error) {
	if item.ID == "" {
		item.ID = newID()
	}
	if item.Status == "" {
		item.Status = "NEW"
	}
	row := models.Contact{
		ID: item.ID, FullName: item.FullName, Email: item.Email,
		Phone: item.Phone, Message: item.Message, Status: item.Status,
		Source: item.Source, Note: item.Note,
	}
	if err := r.db.WithContext(ctx).Create(&row).Error; err != nil {
		return nil, err
	}
	item.CreatedAt = row.CreatedAt
	return &item, nil
}

func (r ContactRepository) ListContacts(
	ctx context.Context,
	page, limit int,
) ([]contact.Contact, int, error) {
	page, limit = pageBounds(page, limit)
	query := r.db.WithContext(ctx).Model(&models.Contact{})
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []models.Contact
	if err := query.Order("created_at DESC").
		Offset((page - 1) * limit).
		Limit(limit).
		Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	items := make([]contact.Contact, 0, len(rows))
	for _, row := range rows {
		items = append(items, contact.Contact{
			ID: row.ID, FullName: row.FullName, Email: row.Email,
			Phone: row.Phone, Message: row.Message, Status: row.Status,
			Source: row.Source, Note: row.Note, CreatedAt: row.CreatedAt,
		})
	}
	return items, int(total), nil
}
