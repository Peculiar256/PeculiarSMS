# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Note: If your build output goes to 'build' instead of 'dist', change /app/dist to /app/build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]