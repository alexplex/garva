# Garva Deployment Guide for Hostinger

## Prerequisites
- Node.js 18+ installed on server
- SSH access to Hostinger
- Domain configured

## Deployment Steps

### 1. Upload Files
Upload all project files to your server (excluding node_modules and .next folders)

### 2. SSH into your server
```bash
ssh your-username@your-server-ip
cd /home/your-username/domains/your-domain.com/public_html
```

### 3. Run deployment script
```bash
bash deploy.sh
```

### 4. Start the application
```bash
# Option 1: Direct start (stops when you close SSH)
npm start

# Option 2: Using PM2 (recommended - keeps running)
npm install -g pm2
pm2 start npm --name "garva" -- start
pm2 save
pm2 startup
```

### 5. Configure reverse proxy (if needed)
Your application runs on port 3000 by default. Hostinger may need you to configure nginx or Apache to proxy requests.

## Updating the Application
```bash
cd /home/your-username/domains/your-domain.com/public_html
git pull  # if using git
bash deploy.sh
pm2 restart garva
```

## Troubleshooting
- Check logs: `pm2 logs garva`
- Restart: `pm2 restart garva`
- Check status: `pm2 status`
- View app logs: `tail -f ~/.pm2/logs/garva-out.log`
