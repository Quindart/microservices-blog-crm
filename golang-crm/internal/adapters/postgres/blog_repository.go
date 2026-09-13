package postgres

import (
	"context"

	"golang-crm/internal/adapters/postgres/models"
	"golang-crm/internal/domain/store/blog"
	"gorm.io/gorm"
)

type BlogRepository struct{ db *gorm.DB }

func NewBlogRepository(db *gorm.DB) BlogRepository {
	return BlogRepository{db: db}
}

func (r BlogRepository) ListCategories(ctx context.Context) ([]blog.Category, error) {
	var rows []models.BlogCategory
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("name ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}
	categories := make([]blog.Category, 0, len(rows))
	for _, row := range rows {
		categories = append(categories, blog.Category{ID: row.ID, Name: row.Name, Slug: row.Slug})
	}
	return categories, nil
}

func (r BlogRepository) ListBlogs(
	ctx context.Context,
	filter blog.BlogFilter,
) ([]blog.Blog, int, error) {
	filter.Page, filter.Limit = pageBounds(filter.Page, filter.Limit)
	query := r.db.WithContext(ctx).
		Model(&models.BlogPost{}).
		Where("status = ?", "PUBLISHED")
	if filter.Category != "" {
		query = query.Where(
			"category_id IN (SELECT id FROM blog_categories WHERE slug = ?)",
			filter.Category,
		)
	}
	if filter.Author != "" {
		query = query.Where(
			"author_id IN (SELECT id FROM blog_authors WHERE slug = ?)",
			filter.Author,
		)
	}
	if filter.Tag != "" {
		query = query.Where(
			"id IN (SELECT post_id FROM blog_post_tags WHERE tag_id IN (SELECT id FROM blog_tags WHERE slug = ?))",
			filter.Tag,
		)
	}
	if filter.Search != "" {
		term := "%" + filter.Search + "%"
		query = query.Where("(title ILIKE ? OR excerpt ILIKE ?)", term, term)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []models.BlogPost
	if err := query.Order("published_at DESC").
		Offset((filter.Page - 1) * filter.Limit).
		Limit(filter.Limit).
		Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	items := make([]blog.Blog, 0, len(rows))
	for _, row := range rows {
		item, err := r.toBlog(ctx, row)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, int(total), nil
}

func (r BlogRepository) GetBlog(ctx context.Context, slug string) (*blog.Blog, error) {
	var row models.BlogPost
	if err := r.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, "PUBLISHED").
		First(&row).Error; err != nil {
		return nil, err
	}
	item, err := r.toBlog(ctx, row)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r BlogRepository) toBlog(
	ctx context.Context,
	row models.BlogPost,
) (blog.Blog, error) {
	item := blog.Blog{
		Slug: row.Slug, Title: row.Title, Excerpt: row.Excerpt,
		Content: row.Content, ContentFormat: row.ContentFormat,
		PublishedAt: &row.PublishedAt, ReadTime: row.ReadTime,
		CoverImageURL: row.CoverImageURL, Tags: []string{},
	}
	if row.CategoryID != "" {
		var category models.BlogCategory
		if err := r.db.WithContext(ctx).
			First(&category, "id = ?", row.CategoryID).Error; err != nil {
			return blog.Blog{}, err
		}
		item.Category = blog.Category{
			ID: category.ID, Name: category.Name, Slug: category.Slug,
		}
	}
	if row.AuthorID != "" {
		var author models.BlogAuthor
		if err := r.db.WithContext(ctx).
			First(&author, "id = ?", row.AuthorID).Error; err != nil {
			return blog.Blog{}, err
		}
		item.Author = blog.Author{
			Name: author.Name, Slug: author.Slug, AvatarURL: author.AvatarURL,
		}
	}
	var joins []models.BlogPostTag
	if err := r.db.WithContext(ctx).
		Where("post_id = ?", row.ID).
		Find(&joins).Error; err != nil {
		return blog.Blog{}, err
	}
	for _, join := range joins {
		var tag models.BlogTag
		if err := r.db.WithContext(ctx).
			First(&tag, "id = ?", join.TagID).Error; err != nil {
			return blog.Blog{}, err
		}
		item.Tags = append(item.Tags, tag.Slug)
	}
	return item, nil
}
