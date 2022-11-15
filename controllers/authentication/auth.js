const express = require("express");
const router = express.Router();

const authHelper = require("../../utils/auth/auth");
const helper = require("../../utils/shared");
const knex = require("../../config/db");
const passport = require("../../utils/auth/local");

router.get(
  "/user/:id",
  async (req, res) => {
    const user = await knex("users").where({ id: req?.params?.id }).first();
    const {password, ...rest} = user
    return res.status(200).send(rest);
  }
);

router.post("/register", helper.upload.single("picture"), async (req, res) => {
  const { email, zipcode } = req.body;
  if (!email || !zipcode) {
    return helper.handleResponse(res, 400, "bad request");
  }
  const user = await knex("users").where({ email: req?.body?.email }).first();
  if (user) {
    return helper.handleResponse(res, 401, "user already exist");
  } else {
    return authHelper
      .createUser(req, res)
      .then((response) => {
        const user = response[0];
        const payload = {
          name: user.name,
          id: user.id,
          email: user.email,
        };
        const token = helper.jwtTokenCreation(payload);
        helper.handleResponseWithData(res, 200, {
          user: payload,
          token: "Bearer " + token,
        });
      })
      .catch((err) => {
        console.log(err);
        helper.handleResponse(res, 500, "error");
      });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  if (!req.user) {
    helper.handleResponse(res, 401, req.messages);
  }
  const payload = {
    name: req.user.name,
    id: req.user.id,
    email: req.user.email,
  };

  const token = helper.jwtTokenCreation(payload);

  res.status(200).send({
    success: true,
    message: "Logged in Successfully",
    token: "Bearer " + token,
    user: payload,
  });
});

router.put(
  "/user/:id",
  async (req, res) => {
    const user = await knex("users").where({ id: req?.params?.id }).first();
    if(user) {
      return authHelper
      .updateUser(req, res)
      .then((response) => {
        const user = response[0];
        const payload = {
          name: user.name,
          id: user.id,
          email: user.email,
        };
        helper.handleResponseWithData(res, 200, {
          user: payload
        });
      })
      .catch((err) => {
        console.log(err);
        helper.handleResponse(res, 500, "error");
      });
    }
    return  res.status(200).send("succes")
  }
);

module.exports = router;
