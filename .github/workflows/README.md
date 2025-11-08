# GitHub Actions Workflows

## Workflows Overview

### 1. Release Workflow (`release.yml`)
**Trigger:** Push to master or create a release/tag

**What it does:**
- Builds Docker image from `zalo-bot/Dockerfile`
- Tags image with version (from tag) or "latest"
- Pushes to Docker Hub

### 2. Deployment Workflow (`deployment.yml`)
**Trigger:** After release workflow completes successfully

**What it does:**
- Connects to SSH server
- Updates `docker-compose.yml` with new image version
- Runs `docker compose up -d` to deploy

## Workflow Sequence

```
Developer: git push origin v1.0.0
           ↓
Release Workflow: Build & Push Image (vkhangstack/studyoptimizer-bot:v1.0.0)
           ↓
Deployment Workflow: 
  → SSH to server
  → Update docker-compose.yml: image: vkhangstack/studyoptimizer-bot:v1.0.0
  → docker compose up -d
  → Verify containers running
           ↓
Deployment Complete! 🎉
```

## Required Secrets

Configure in **Settings → Secrets and variables → Actions**:

### SSH Secrets
- `SSH_HOST` - Server hostname/IP
- `SSH_USER` - SSH username  
- `SSH_PRIVATE_KEY` - SSH private key (entire key including headers)
- `SSH_PORT` - SSH port (optional, defaults to 22)

### Docker Secrets
- `DOCKER_USERNAME` - Docker Hub username (e.g., vkhangstack)
- `DOCKER_PASSWORD` - Docker Hub password/token

## Example Usage

### Deploy with Tag
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Deploy Latest (push to master)
```bash
git push origin master
```

## What Gets Updated

In `~/study-optimizer/zalo-bot/docker-compose.yml` on your server:

```yaml
# Before
image: vkhangstack/studyoptimizer-bot:latest

# After (when you push v1.0.0)
image: vkhangstack/studyoptimizer-bot:v1.0.0
```

## Monitoring

1. Go to repository → **Actions** tab
2. You'll see two workflow runs:
   - ✅ Release - Build and Push Docker Image
   - ✅ Deploy to SSH Server (starts after release completes)

## Server Setup

Your server needs:

```bash
# 1. Docker & Docker Compose installed
sudo apt update
sudo apt install docker.io docker-compose-plugin

# 2. User in docker group
sudo usermod -aG docker $USER

# 3. Project directory
mkdir -p ~/study-optimizer/zalo-bot
cd ~/study-optimizer
git clone https://github.com/vkhangstack/study-optimizer.git

# 4. Environment file
cd zalo-bot
cp .env.example .env
nano .env  # Edit with your values
```

## Troubleshooting

### Workflow Not Starting
- Check if release workflow completed successfully
- Verify you pushed to `master` branch or created a tag

### SSH Connection Failed  
- Verify `SSH_HOST`, `SSH_USER` secrets are correct
- Check `SSH_PRIVATE_KEY` includes the full key with headers
- Test connection: `ssh -i ~/.ssh/key user@host`

### Image Pull Failed
- Verify `DOCKER_USERNAME` is correct
- Check Docker Hub for the image
- Ensure release workflow succeeded

### Containers Not Starting
```bash
# SSH to server and check
cd ~/study-optimizer/zalo-bot
docker compose ps
docker compose logs
```

## Advanced: Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
# SSH to server
ssh user@your-server.com
cd ~/study-optimizer/zalo-bot

# Update image version
sed -i 's|image: .*/studyoptimizer-bot:.*|image: vkhangstack/studyoptimizer-bot:v1.0.0|g' docker-compose.yml

# Deploy
docker pull vkhangstack/studyoptimizer-bot:v1.0.0
docker compose up -d

# Verify
docker compose ps
docker compose logs -f
```

## Security Notes

✅ **Do:**
- Use SSH keys (not passwords)
- Store all secrets in GitHub Secrets
- Use Docker Hub access tokens (not passwords)
- Keep secrets rotated regularly

❌ **Don't:**
- Commit .env files
- Share SSH private keys
- Expose secrets in logs
- Use root user for deployment

For detailed setup instructions, see [DEPLOYMENT.md](../../DEPLOYMENT.md)
