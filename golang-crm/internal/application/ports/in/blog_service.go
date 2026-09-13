package in

import (
	"context"

	"golang-crm/internal/domain/store/blog"
)

type BlogService interface {
	ListCategories(context.Context) ([]blog.Category, error)
	ListBlogs(context.Context, blog.BlogFilter) ([]blog.Blog, int, error)
	GetBlog(context.Context, string) (*blog.Blog, error)
}
