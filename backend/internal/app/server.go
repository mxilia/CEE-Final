package app

import "log"

func Start() {
	db, cfg, err := setupDependencies("dev")
	if err != nil {
		log.Fatalf("Failed to setup dependencies: %v", err)
	}

	app, err := setupRestServer(db, cfg)
	if err != nil {
		log.Fatalf("Failed to setup Rest server: %v", err)
	}

	app.Listen("0.0.0.0:8000")
}
