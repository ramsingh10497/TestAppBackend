const authRoutes = require("../controllers/authentication/auth");

function routeConfig(app) {
  app.use("/auth", authRoutes);
}

module.exports = routeConfig;
