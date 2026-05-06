package transaction

import (
	"context"
)

type TransactionManager interface {
	Do(ctx context.Context, fn func(txCtx context.Context) error) error
}
