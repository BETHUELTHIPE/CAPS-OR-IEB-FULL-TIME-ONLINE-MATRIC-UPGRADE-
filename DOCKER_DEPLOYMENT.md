# Docker Hub Deployment Guide: Amaris Mathematics Hub

This repository is configured to build and deploy directly to Docker Hub repository:  
**`bethuelm/amaris-mathematics-deploy-v1`**

---

## 🚀 Quick Start (Local Machine or Server)

### 1. Authenticate with Docker Hub
```bash
docker login -u bethuelm
```
*(Enter your Docker Hub password or Personal Access Token when prompted)*

---

### 2. Build and Push Using the Automated Script
Make sure the script is executable and run:
```bash
chmod +x ./deploy-docker.sh
./deploy-docker.sh
```

Or specify a custom release tag:
```bash
./deploy-docker.sh v1.0.0
```

---

### 3. Manual Build and Push Commands
If you prefer running raw Docker commands:

```bash
# 1. Build the production image
docker build -t bethuelm/amaris-mathematics-deploy-v1:latest .

# 2. Push to Docker Hub
docker push bethuelm/amaris-mathematics-deploy-v1:latest
```

---

### 4. Running the Container

#### Using Docker CLI:
```bash
docker run -d \
  --name amaris-mathematics-hub \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_gemini_api_key_here \
  bethuelm/amaris-mathematics-deploy-v1:latest
```

#### Using Docker Compose:
```bash
docker compose up -d
```

Your app will be live and accessible at **`http://localhost:3000`**.

---

## 🔄 Automated CI/CD (GitHub Actions)
If exported to GitHub, the included workflow at `.github/workflows/docker-publish.yml` will automatically build and publish to `bethuelm/amaris-mathematics-deploy-v1:latest` upon push.
- Configure repository secrets:
  - `DOCKERHUB_USERNAME`: `bethuelm`
  - `DOCKERHUB_TOKEN`: *Your Docker Hub Access Token*
