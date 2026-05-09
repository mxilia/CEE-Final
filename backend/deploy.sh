#!/bin/bash

# ===== CONFIG =====
IMAGE_NAME="cee-backend"
DOCKER_USER="symoney"
TAG="latest"

# ===== STEP 1: Build + push (correct architecture) =====

echo "Building & pushing Docker image (linux/amd64)..."

docker buildx build \
  --platform linux/amd64 \
  -t $DOCKER_USER/$IMAGE_NAME:$TAG \
  --push .

echo "Done 🚀"