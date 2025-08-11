# -------- Build stage --------
FROM node:20-alpine AS build
# git is needed if any dep resolves from a git URL
RUN apk add --no-cache git
WORKDIR /app

# copy only the RT app
COPY apps/rt/package.json ./package.json
COPY apps/rt/tsconfig.json ./tsconfig.json
COPY apps/rt/src ./src

# install deps INCLUDING devDeps (for tsc)
RUN npm install --include=dev

# compile TypeScript
RUN npm run build

# drop devDeps from the final image
RUN npm prune --omit=dev


# -------- Runtime stage --------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=2567
EXPOSE 2567

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

CMD ["node", "dist/index.js"]
