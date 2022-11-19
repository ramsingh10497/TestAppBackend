const express = require("express");
const router = express.Router();
const {
  logoutUser,
  updateUserProfile,
  userLogin,
  userRegister,
  loggedUsers,
  getUser,
} = require("../controllers/authentication/auth");
const passport = require("../utils/auth/local");

router.get("/user/:id", (req, res) => {
  getUser(req, res);
});

router.get("/loggedUsers", (req, res) => {
  loggedUsers(req, res);
});

router.post("/register", (req, res) => {
  userRegister(req, res);
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  userLogin(req, res);
});

router.put("/user/:id", (req, res) => {
  updateUserProfile(req, res);
});

router.get("/logout", (req, res) => {
  logoutUser(req, res);
});

module.exports = router;
