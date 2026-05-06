package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/mxilia/CEE-Final/pkg/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB    *gorm.DB
	sqlDB *sql.DB
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)
	db, err := gorm.Open(postgres.Open(cfg.DatabaseDSN), &gorm.Config{Logger: newLogger})
	if err != nil {
		return nil, err
	}

	sqlDB, err = db.DB()
	if err != nil {
		return nil, err
	}

	DB = db
	log.Println("Database successfully connected.")
	return db, nil
}

func Close() error {
	if sqlDB != nil {
		sqlDB.Close()
	}
	return nil
}
