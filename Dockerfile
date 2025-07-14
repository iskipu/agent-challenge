FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies and Node.js
RUN apt-get update && \
  apt-get install -y curl ca-certificates gnupg lsb-release sudo unzip \
  && curl -fsSL https://ollama.com/install.sh | sh \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# # Override the default entrypoint
ENTRYPOINT ["/bin/bash", "-c"]

# Start Ollama service and pull the model, then run the app
CMD ["cp .env.docker .env && source .env && (ollama serve&) && sleep 5 && ollama pull ${REASONING_MODEL_NAME_AT_ENDPOINT} && ollama pull ${EMBEDING_MODEL_NAME_AT_ENDPOINT} && pnpm run dev"]