module.exports = {
  apps: [
    {
      name: "backend",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    prod: {
      user: "ubuntu",
      host: "15.207.161.63",
      ref: "origin/master",
      repo: "git@github.com:mihirextramile/backend.git",
      path: "/var/www/extramileplay/backend",
      "post-deploy": `npm install && npm run db:deploy && npx prisma generate && pm2 reload ecosystem.config.js --env production`
    }
  }
};
