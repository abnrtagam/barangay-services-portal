// PM2 Process Manager Configuration
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 stop barangay-api
//   pm2 restart barangay-api
//   pm2 logs barangay-api

module.exports = {
  apps: [{
    name: 'barangay-api',
    script: 'server.js',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
