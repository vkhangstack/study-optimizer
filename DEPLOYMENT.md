# Deployment Setup Guide

## Quick Setup for SSH Deployment

### 1. Configure GitHub Secrets

Go to your GitHub repository: **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name       | Description           | Example                          |
| ----------------- | --------------------- | -------------------------------- |
| `SSH_HOST`        | Server hostname or IP | `example.com` or `192.168.1.100` |
| `SSH_USER`        | SSH username          | `ubuntu` or `deploy`             |
| `SSH_PRIVATE_KEY` | SSH private key       | Content of `~/.ssh/id_rsa`       |
| `SSH_PORT`        | SSH port (optional)   | `22` (default)                   |
| `DOCKER_USERNAME` | Docker Hub username   | `vkhangstack`                    |
| `DOCKER_PASSWORD` | Docker Hub password   | Your Docker Hub token            |

### 2. Setup SSH Key

On your local machine:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server.com

# Get private key for GitHub secret
cat ~/.ssh/github_deploy
# Copy the entire output including BEGIN and END lines
```

### 3. Server Requirements

Your server needs:
- Docker and Docker Compose installed
- Deployment directory: `~/study-optimizer/zalo-bot`
- User with Docker permissions

```bash
# On your server
sudo usermod -aG docker $USER
mkdir -p ~/study-optimizer/zalo-bot
cd ~/study-optimizer
git clone https://github.com/vkhangstack/study-optimizer.git
```

### 4. How It Works

The deployment workflow:

1. ✅ Waits for release workflow to complete successfully
2. ✅ Extracts version from tag or uses "latest"
3. ✅ Connects to SSH server
4. ✅ Updates image line in `docker-compose.yml`: 
   ```yaml
   image: vkhangstack/studyoptimizer-bot:v1.0.0
   ```
5. ✅ Pulls the new Docker image
6. ✅ Runs `docker compose up -d`
7. ✅ Verifies containers are running

### 5. Trigger Deployment

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Or push to master
git push origin master
```

### 6. Monitor Deployment

- Go to GitHub → **Actions** tab
- Watch both workflows:
  1. "Release - Build and Push Docker Image"
  2. "Deploy to SSH Server"

### 7. Verify on Server

```bash
ssh user@your-server.com
cd ~/study-optimizer/zalo-bot

# Check containers
docker compose ps

# View logs
docker compose logs -f

# Check the updated image
grep "image:" docker-compose.yml
```

## Troubleshooting

### SSH Connection Failed
```bash
# Test SSH connection locally
ssh -i ~/.ssh/github_deploy user@your-server.com

# Check SSH key format (should have line breaks)
cat ~/.ssh/github_deploy
```

### Image Not Found
- Verify `DOCKER_USERNAME` secret matches your Docker Hub username
- Check the release workflow completed successfully
- Verify image exists on Docker Hub

### Containers Not Starting
```bash
# SSH into server and check logs
ssh user@your-server.com
cd ~/study-optimizer/zalo-bot
docker compose logs
```

## Manual Deployment

If you need to deploy manually:

```bash
ssh user@your-server.com
cd ~/study-optimizer/zalo-bot

# Update image version in docker-compose.yml
sed -i 's|image: .*/studyoptimizer-bot:.*|image: vkhangstack/studyoptimizer-bot:v1.0.0|g' docker-compose.yml

# Pull and deploy
docker pull vkhangstack/studyoptimizer-bot:v1.0.0
docker compose up -d

# Check status
docker compose ps
```

## What Gets Updated

The workflow automatically updates this line in `docker-compose.yml`:

**Before:**
```yaml
image: vkhangstack/studyoptimizer-bot:latest
```

**After (for tag v1.0.0):**
```yaml
image: vkhangstack/studyoptimizer-bot:v1.0.0
```

This ensures your server always runs the exact version you released!
