# Build the Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Allow the API base to be configured at build-time
ARG VITE_API_BASE=http://localhost:4000/api
ARG VITE_USE_STUB_API=false
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_USE_STUB_API=${VITE_USE_STUB_API}

RUN npm run build

# Production runtime for the API + statics
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY backend ./backend
COPY --from=frontend-builder /app/dist ./dist

# Configurable runtime settings
ENV PORT=4000
ENV STATIC_DIR=/app/dist
ENV UPLOAD_DIR=/data/uploads
ENV CLIENT_ORIGIN=
ENV DATABASE_URL=file:./data/exhibit.sqlite

RUN mkdir -p ${UPLOAD_DIR}

EXPOSE 4000
CMD ["node", "backend/server.js"]
