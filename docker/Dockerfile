# --- Etapa 1: Dependencias ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiamos los archivos de dependencias
COPY frontapp/package.json ./
RUN pnpm install --no-frozen-lockfile

# --- Etapa 2: Builder ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Instalar pnpm en esta etapa también
RUN npm install -g pnpm

# Copiamos las dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el resto del código de la aplicación
COPY frontapp/ ./

# Construimos la aplicación
RUN pnpm run build

# --- Etapa 3: Runner (Imagen Final) ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiamos la salida 'standalone' del builder
COPY --from=builder /app/.next/standalone ./
# Copiamos los assets públicos y estáticos
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]