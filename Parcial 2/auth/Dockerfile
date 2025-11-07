FROM node:20-alpine AS runtime
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

COPY index.js ./

EXPOSE 3001
CMD ["node","index.js"]
