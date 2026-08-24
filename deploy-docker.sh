#!/usr/bin/env bash
# ==============================================================================
# Build and Push Script for Docker Hub Repository:
# bethuelm/amaris-mathematics-deploy-v1
# ==============================================================================

set -e

IMAGE_NAME="bethuelm/amaris-mathematics-deploy-v1"
TAG="${1:-latest}"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"

echo "========================================================"
echo " Packaging & Deploying Amaris Mathematics Hub"
echo " Target: ${FULL_IMAGE}"
echo "========================================================"

# Step 1: Check Docker Login
echo "[1/4] Checking Docker authentication..."
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running or current user does not have permission."
  exit 1
fi

# Step 2: Build Docker image
echo "[2/4] Building Docker container image..."
docker build -t "${FULL_IMAGE}" .

# Step 3: Tag additional version if provided
if [ "${TAG}" != "latest" ]; then
  echo "[3/4] Tagging as latest as well..."
  docker tag "${FULL_IMAGE}" "${IMAGE_NAME}:latest"
else
  echo "[3/4] Tagged as :latest"
fi

# Step 4: Push to Docker Hub
echo "[4/4] Pushing to Docker Hub..."
echo "If prompted, please authenticate with 'docker login' using your Docker Hub account (bethuelm)."
docker push "${IMAGE_NAME}:${TAG}"

if [ "${TAG}" != "latest" ]; then
  docker push "${IMAGE_NAME}:latest"
fi

echo "========================================================"
echo " Successfully pushed to Docker Hub!"
echo " Image URI: docker.io/${IMAGE_NAME}:${TAG}"
echo " Pull Command: docker pull ${IMAGE_NAME}:${TAG}"
echo " Run Command:  docker run -p 3000:3000 ${IMAGE_NAME}:${TAG}"
echo "========================================================"
