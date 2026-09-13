package postgres

import (
	"context"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/landing"
	"gorm.io/gorm"
)

type LandingRepository struct{ db *gorm.DB }

func NewLandingRepository(db *gorm.DB) LandingRepository {
	return LandingRepository{db: db}
}

func (r LandingRepository) ListLandingPages(
	ctx context.Context,
	page, limit int,
) ([]landing.LandingPage, int, error) {
	page, limit = pageBounds(page, limit)
	query := r.db.WithContext(ctx).
		Model(&models.LandingPage{}).
		Where("status = ?", "PUBLISHED")
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []models.LandingPage
	if err := query.Order("created_at DESC").
		Offset((page - 1) * limit).
		Limit(limit).
		Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	items := make([]landing.LandingPage, 0, len(rows))
	for _, row := range rows {
		item, err := r.toLandingPage(ctx, row)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, int(total), nil
}

func (r LandingRepository) GetLandingPage(
	ctx context.Context,
	slug string,
) (*landing.LandingPage, error) {
	var row models.LandingPage
	if err := r.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, "PUBLISHED").
		First(&row).Error; err != nil {
		return nil, err
	}
	item, err := r.toLandingPage(ctx, row)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r LandingRepository) toLandingPage(
	ctx context.Context,
	row models.LandingPage,
) (landing.LandingPage, error) {
	item := landing.LandingPage{
		ID: row.ID, Slug: row.Slug, Title: row.Title,
		Description:  row.Description,
		Price:        landing.Price{Amount: row.Price, Currency: row.Currency},
		ThumbnailURL: row.ThumbnailURL,
		Features:     []string{},
	}
	if row.CategoryID != "" {
		var category models.LandingCategory
		if err := r.db.WithContext(ctx).
			First(&category, "id = ?", row.CategoryID).Error; err != nil {
			return landing.LandingPage{}, err
		}
		item.Category = category.Name
	}
	var features []models.LandingFeature
	if err := r.db.WithContext(ctx).
		Where("landing_page_id = ?", row.ID).
		Order("sort_order").
		Find(&features).Error; err != nil {
		return landing.LandingPage{}, err
	}
	for _, feature := range features {
		item.Features = append(item.Features, feature.Content)
	}
	return item, nil
}
