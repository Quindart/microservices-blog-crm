package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/order"
)

type OrderUseCase struct{ orderRepository out.OrderRepository }

func NewOrderUseCase(repository out.OrderRepository) OrderUseCase {
	return OrderUseCase{orderRepository: repository}
}

func (u OrderUseCase) GetByParams(ctx context.Context, limit, offset int) ([]order.Order, error) {
	return u.orderRepository.GetByParams(ctx, limit, offset)
}

func (u OrderUseCase) GetByID(ctx context.Context, id string) (*order.Order, error) {
	return u.orderRepository.GetByID(ctx, id)
}

func (u OrderUseCase) GetByCustomerID(ctx context.Context, customerID string) ([]order.Order, error) {
	return u.orderRepository.GetByCustomerID(ctx, customerID)
}
