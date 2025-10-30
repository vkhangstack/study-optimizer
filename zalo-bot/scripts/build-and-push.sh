# !/bin/bash
# This script is used to manually build the Docker images for the MyScore project.
# docker build -t vkhangstack/studyoptimizer-bot:20250911.0.9 .

# Docker Build and Push Script
# Usage: ./build-and-push.sh <version>
# Example: ./build-and-push.sh 1.0.0

set -e  # Exit on error

# Configuration
IMAGE_NAME="studyoptimizer-bot"
REGISTRY="docker.io"  # Change to your registry (e.g., ghcr.io, gcr.io)
REPOSITORY="vkhangstack"  # Change to your Docker Hub username or registry path

# Check if version parameter is provided
if [ -z "$1" ]; then
    echo "Error: Version parameter is required"
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.0"
    exit 1
fi

VERSION=$1

# Full image name with tag
FULL_IMAGE_NAME="${REGISTRY}/${REPOSITORY}/${IMAGE_NAME}:${VERSION}"
LATEST_TAG="${REGISTRY}/${REPOSITORY}/${IMAGE_NAME}:latest"

echo "=================================="
echo "Docker Build and Push"
echo "=================================="
echo "Image: ${FULL_IMAGE_NAME}"
echo "Latest: ${LATEST_TAG}"
echo "=================================="

# Build the Docker image
echo "Building Docker image..."
docker build -t ${FULL_IMAGE_NAME} -t ${LATEST_TAG} .

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

# Push the versioned image
echo "Pushing versioned image: ${FULL_IMAGE_NAME}"
docker push ${FULL_IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo "✓ Push successful (version: ${VERSION})"
else
    echo "✗ Push failed"
    exit 1
fi

# Push the latest tag
echo "Pushing latest tag: ${LATEST_TAG}"
docker push ${LATEST_TAG}

if [ $? -eq 0 ]; then
    echo "✓ Push successful (latest)"
else
    echo "✗ Push failed"
    exit 1
fi

echo "=================================="
echo "✓ All operations completed successfully!"
echo "Image pushed: ${FULL_IMAGE_NAME}"
echo "Latest tag pushed: ${LATEST_TAG}"
echo "=================================="