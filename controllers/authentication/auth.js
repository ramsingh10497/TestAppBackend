const authHelper = require("../../utils/auth/auth");
const helper = require("../../utils/shared");
const knex = require("../../config/db");
const { positionPath } = require("../../utils/externalAPIpath");
const fetch = require("node-fetch")
require('dotenv').config()

const getUser = async (req, res) => {
  const user = await knex("users").where({ id: req?.params?.id }).first();
  const { password, ...rest } = user;
  return res.status(200).send(rest);
};

const loggedUsers = (req, res) => {
  let sessions = req.sessionStore.sessions;
  res.status(200).send(sessions);
};

const userRegister = async (req, res) => {
  const { email, zipcode } = req.body;
  if (!email || !zipcode) {
    return helper.handleResponse(res, 400, "bad request");
  }

  let headersList = {
    "Accept": "*/*"
   }
   let response = await fetch(`${positionPath}?access_key=${process.env.POSTIONSTACK_ACCESS_KEY}&query=${zipcode}&limit=1`, { 
     method: "GET",
     headers: headersList
   });
   let data = await response.json();
   req.body.lat = data.data[0].latitude ?? 0
   req.body.long = data.data[0].longitude ?? 0

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
};

const userLogin = (req, res) => {
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
};

const updateUserProfile = async (req, res) => {
  const user = await knex("users").where({ id: req?.params?.id }).first();
  if (user) {
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
          user: payload,
        });
      })
      .catch((err) => {
        console.log(err);
        helper.handleResponse(res, 500, "error");
      });
  }
  return res.status(200).send("success");
};

const logoutUser = (req, res) => {
  req.session.destroy();
  res.status(200).send("Logout Successfully");
};

module.exports = {
  logoutUser,
  updateUserProfile,
  userLogin,
  userRegister,
  loggedUsers,
  getUser,
};
