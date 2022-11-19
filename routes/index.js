const authRoutes = require("./auth");

function routeConfig(app) {
  app.use("/auth", authRoutes);
}

module.exports = routeConfig;
