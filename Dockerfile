# Stage 1: Build Environment
FROM node:18 AS build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Stage 2: Runtime environment
FROM node:18-alpine AS final-stage
WORKDIR /app
COPY --from=build-stage /app /app


EXPOSE 4000
CMD [ "npm", "start" ]
