# Stage 1: Base - Common dependencies
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Development - For hot-reloading
FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Build - Production build
FROM base AS build
COPY . .
RUN npm run build

# Stage 4: Production - Serve with Nginx
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
