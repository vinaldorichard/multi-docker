# Build phase
FROM node:alpine as builder
WORKDIR '/app'
COPY package.json . 
RUN npm install 
COPY . . 
RUN npm run build

# New container
# Run phase
FROM nginx
# Expose the port
EXPOSE 3000
# Copy nginx default conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# Copy from build phase to nginx dir
COPY --from=builder /app/build /usr/share/nginx/html
