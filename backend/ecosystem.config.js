module.exports = {
  apps: [
    {
        name: "Ease",
        script: "./dist/app.js",
        env_production:{
            NODE_ENV: "production",
        }
    }]
}
