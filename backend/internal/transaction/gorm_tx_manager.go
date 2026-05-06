package transaction

import (
	"context"

	"gorm.io/gorm"
)

type txKey struct{}

type GormTxManager struct {
	db *gorm.DB
}

func NewGormTxManager(db *gorm.DB) TransactionManager {
	return &GormTxManager{db: db}
}

func (m *GormTxManager) Do(ctx context.Context, fn func(txCtx context.Context) error) error {
	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txCtx := context.WithValue(ctx, txKey{}, tx)
		return fn(txCtx)
	})
}

func GetTx(ctx context.Context, db *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return db
}
