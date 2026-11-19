FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development
COPY . .
ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOVABLE_NITRO_PRESET=node-server
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

FROM dependencies AS build
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOVABLE_NITRO_PRESET=node-server
RUN npm run build

FROM build AS production-dependencies
RUN npm prune --omit=dev

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV SMTP_SETTINGS_FILE=/data/smtp-settings.enc
ENV SITE_CONTENT_DB_FILE=/data/site-content.json
ENV SITE_MEDIA_DIR=/data/media
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
RUN mkdir -p /data && chown -R node:node /app /data
USER node
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
