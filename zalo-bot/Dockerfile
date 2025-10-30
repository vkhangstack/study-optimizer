# Stage 1: Install dependencies & build
FROM oven/bun:latest AS builder
WORKDIR /app


# Copy only manifest files to leverage layer cache
COPY package.json bun.lock bunfig.toml ./
COPY prisma ./prisma/
RUN bun install

# Copy source code and build
COPY . ./

RUN bun build src/index.ts --outdir dist --target bun --packages external

# Stage 2: Minimal runtime image
FROM ubuntu:24.04 AS runtime

RUN apt-get update && apt-get install -y openssl curl iputils-ping unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
RUN bun --version

WORKDIR /app


# Copy only the built output and production dependencies
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/bunfig.toml ./


EXPOSE 3000
CMD ["bun", "dist/index.js"]
