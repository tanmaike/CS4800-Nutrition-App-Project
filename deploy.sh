#!/bin/bash
# Deployment script for EC2

echo "Starting deployment..."

# Build frontend
echo "Building frontend..."
npm run build

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data dist
sudo chmod -R 755 dist
sudo find dist -type f -exec chmod 644 {} \;

# Restart backend
echo "Restarting backend..."
pm2 restart sjh-fitness-api || pm2 start backend/server.js --name sjh-fitness-api

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment complete!"