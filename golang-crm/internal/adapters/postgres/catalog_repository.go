package postgres

import (
	"context"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/catalog"
	"gorm.io/gorm"
)

type CatalogRepository struct{ db *gorm.DB }

func NewCatalogRepository(db *gorm.DB) CatalogRepository {
	return CatalogRepository{db: db}
}

func (r CatalogRepository) ListCategories(ctx context.Context) ([]catalog.Category, error) {
	var rows []models.CatalogCategory
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("name ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}
	categories := make([]catalog.Category, 0, len(rows))
	for _, row := range rows {
		categories = append(categories, catalog.Category{ID: row.ID, Name: row.Name, Slug: row.Slug})
	}
	return categories, nil
}

func (r CatalogRepository) ListProducts(
	ctx context.Context,
	filter catalog.ProductFilter,
) ([]catalog.Product, int, error) {
	filter.Page, filter.Limit = pageBounds(filter.Page, filter.Limit)
	query := r.db.WithContext(ctx).
		Model(&models.CatalogProduct{}).
		Where("status = ?", "ACTIVE")
	if filter.Category != "" {
		query = query.Where(
			"category_id IN (SELECT id FROM categories WHERE slug = ?)",
			filter.Category,
		)
	}
	if filter.Search != "" {
		term := "%" + filter.Search + "%"
		query = query.Where(
			"(name ILIKE ? OR short_description ILIKE ?)",
			term,
			term,
		)
	}
	if filter.MinPrice != nil {
		query = query.Where(
			"id IN (SELECT product_id FROM product_variants WHERE price >= ?)",
			*filter.MinPrice,
		)
	}
	if filter.MaxPrice != nil {
		query = query.Where(
			"id IN (SELECT product_id FROM product_variants WHERE price <= ?)",
			*filter.MaxPrice,
		)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	switch filter.Sort {
	case "price_asc":
		query = query.Order(
			"(SELECT min(price) FROM product_variants WHERE product_id = products.id) ASC",
		)
	case "price_desc":
		query = query.Order(
			"(SELECT min(price) FROM product_variants WHERE product_id = products.id) DESC",
		)
	case "rating", "popular":
		query = query.Order("rating_average DESC")
	default:
		query = query.Order("created_at DESC")
	}

	var rows []models.CatalogProduct
	if err := query.
		Offset((filter.Page - 1) * filter.Limit).
		Limit(filter.Limit).
		Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	products := make([]catalog.Product, 0, len(rows))
	for _, row := range rows {
		product, err := r.toProduct(ctx, row)
		if err != nil {
			return nil, 0, err
		}
		products = append(products, product)
	}
	return products, int(total), nil
}

func (r CatalogRepository) GetProduct(
	ctx context.Context,
	slug string,
) (*catalog.Product, error) {
	var row models.CatalogProduct
	if err := r.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, "ACTIVE").
		First(&row).Error; err != nil {
		return nil, err
	}
	product, err := r.toProduct(ctx, row)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r CatalogRepository) toProduct(
	ctx context.Context,
	row models.CatalogProduct,
) (catalog.Product, error) {
	product := catalog.Product{
		ID:               row.ID,
		Slug:             row.Slug,
		Name:             row.Name,
		ShortDescription: row.ShortDescription,
		Description:      row.Description,
		Badge:            row.Badge,
		Highlight:        row.Highlight,
		FreeShipping:     row.FreeShipping,
		Rating:           catalog.Rating{Average: row.RatingAverage, Count: row.ReviewCount},
	}
	if row.CategoryID != "" {
		var category models.CatalogCategory
		if err := r.db.WithContext(ctx).
			First(&category, "id = ?", row.CategoryID).Error; err != nil {
			return catalog.Product{}, err
		}
		product.Category = catalog.Category{
			ID: category.ID, Name: category.Name, Slug: category.Slug,
		}
	}

	var variants []models.CatalogVariant
	if err := r.db.WithContext(ctx).
		Where("product_id = ? AND is_active = ?", row.ID, true).
		Order("is_default DESC").
		Find(&variants).Error; err != nil {
		return catalog.Product{}, err
	}
	for _, variant := range variants {
		item := catalog.Variant{
			ID:        variant.ID,
			SKU:       variant.SKU,
			Name:      variant.Name,
			ColorName: variant.ColorName,
			ColorCode: variant.ColorCode,
			Price:     catalog.Price{Amount: variant.Price, Currency: variant.Currency},
			Stock:     variant.Stock,
			Available: variant.Stock > 0,
		}
		if len(product.Variants) == 0 {
			product.Price = item.Price
		}
		product.Variants = append(product.Variants, item)
	}
	for _, variant := range product.Variants {
		if variant.Stock > 0 {
			product.InStock = true
			break
		}
	}

	var media []models.CatalogMedia
	if err := r.db.WithContext(ctx).
		Where("product_id = ?", row.ID).
		Order("sort_order").
		Find(&media).Error; err != nil {
		return catalog.Product{}, err
	}
	for _, item := range media {
		mediaItem := catalog.Media{URL: item.URL, Alt: item.AltText, IsPrimary: item.IsPrimary}
		product.Media = append(product.Media, mediaItem)
		if product.Thumbnail == nil || item.IsPrimary {
			thumbnail := mediaItem
			product.Thumbnail = &thumbnail
		}
	}
	return product, nil
}
