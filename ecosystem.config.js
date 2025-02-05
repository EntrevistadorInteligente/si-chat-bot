module.exports = {
    apps: [{
      name: "chat-app",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }