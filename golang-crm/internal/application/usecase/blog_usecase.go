package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/blog"
)

type BlogUseCase struct{ repository out.BlogRepository }

func NewBlogUseCase(repository out.BlogRepository) BlogUseCase {
	return BlogUseCase{repository: repository}
}

func (u BlogUseCase) ListCategories(ctx context.Context) ([]blog.Category, error) {
	return u.repository.ListCategories(ctx)
}

func (u BlogUseCase) ListBlogs(
	ctx context.Context,
	filter blog.BlogFilter,
) ([]blog.Blog, int, error) {
	return u.repository.ListBlogs(ctx, filter)
}

func (u BlogUseCase) GetBlog(ctx context.Context, slug string) (*blog.Blog, error) {
	return u.repository.GetBlog(ctx, slug)
}
