# Stage 1: Build the Angular application
FROM node:18-alpine AS build

# Setup the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy other files and folders to the working directory
COPY . .

# Build Angular application in PROD mode
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy built Angular app files to Nginx HTML folder
COPY --from=build /app/dist/join-joy-front/browser /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]