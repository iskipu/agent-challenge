# 🚀 NOSANA Agent Challenge

<div align="center">

[![🎬 Demo Video on X](https://img.shields.io/badge/🎬%20Demo%20Video-X%20Platform-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/iskipu_/status/1944712448063467755)

🚨 **Note:** _Click the badge above and **scroll down** to watch the full demo! under the tweet._

## </div>

## 🤖 Agents Included

### 1️⃣ ⭐⭐ Agent NOS ⭐⭐

**Purpose:**  
Your dedicated AI assistant for the [Nosana Network](https://nosana.io) — answers any NOSANA-related queries with ease.

**🧰 Tools Available:**

- **`nosanaDocQueryTool`** — Query official Nosana documentation for explanations, definitions, and how-tos. (Built using RAG)
- **`nosanaStatsTool`** — Fetch real-time NOS token related statistics.
- **`nosanaGpuMarketTool`** — Get up-to-date GPU market data from Nosana marketplace.
- **`nosanaStakingTool`** — Retrieve staking details and rewards information for NOS.
- **`nosanaJobInfoTool`** — Look up Nosana jobs, and run info.
- **`nosanaHostDetailsTool`** — Fetch detailed info about hosts on the Nosana Network.

---

### 2️⃣ Crypto Analyzer Agent

**Purpose:**  
Stay ahead of the crypto market — this agent combines real-time candlestick data from Binance with the latest news sentiment to give you actionable market insights.

**🔍 Features:**

- Fetch latest candlestick data (OHLCV) for any crypto pair from Binance.
- Analyze real-time news using a news API to gauge market sentiment.
- Combine price and sentiment data to help you make better trading decisions.

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/nosana-ai/agent-challenge.git
cd agent-challenge

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your LLM endpoint, API keys, and other settings

# Start the dev server
pnpm run dev
```

Visit [http://localhost:8080](http://localhost:8080) to interact with the agents.

---

## 🚀 Deployment

### ✅ Docker

```bash
# Build and tag your Docker image
docker build -t yourusername/agent-challenge:latest .

# Run the container locally
docker run -p 8080:8080 --env-file .env yourusername/agent-challenge:latest

# Push to Docker Hub (optional)
docker login
docker push yourusername/agent-challenge:latest
```

### ✅ Deploy to Nosana

1. Edit `nos_job_def/nosana_mastra.json` to use your Docker image URL:  
   `"image": "docker.io/yourusername/agent-challenge:latest"`

2. Deploy via CLI:

   ```bash
   nosana job post --file nosana_mastra.json --market nvidia-3060 --timeout 30
   ```

3. Or use the [Nosana Dashboard](https://dashboard.nosana.com/deploy) for an easy deploy experience.

---

## 🔗 Useful Links

- 🎬 [Demo Video](https://x.com/iskipu_/status/1944712448063467755)
- 📚 [Nosana Docs](https://docs.nosana.io)
- 🚀 [Nosana Dashboard](https://dashboard.nosana.com/deploy)

---
