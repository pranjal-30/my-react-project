# Use the official Nginx image as the base image
#FROM nginx:latest

# Copy the Nginx configuration file
#COPY my-nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build files from your React app to the Nginx web root directory
#COPY build /usr/share/nginx/html

# Expose port 80 to the outside world
#EXPOSE 80

# Start Nginx when the container is run
#CMD ["nginx", "-g", "daemon off;"]

FROM node:14-alpine

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
