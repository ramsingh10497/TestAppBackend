const authHelper = require("../../utils/auth/auth");
const helper = require("../../utils/shared");
const knex = require("../../config/db");
const { positionPath } = require("../../utils/externalAPIpath");
const fetch = require("node-fetch");
require("dotenv").config();

// getting Specefic user
const getUser = async (req, res) => {
  const user = await knex("users").where({ id: req?.params?.id }).first();
  const { password, ...rest } = user;
  return res.status(200).send(rest);
};

// getting logged user by lat and long
const loggedUsers = async (req, res) => {
  let sessions = req.sessionStore.sessions;
  const sessionName = Object.keys(sessions);
  const sessionNameValues = Object.values(sessions).map((item) =>
    JSON.parse(item)
  );
  const currentUser = req.session?.passport?.user;

  const loggedUsers = sessionNameValues.map((item, index) => {
    if (item?.passport && currentUser?.id !== item.passport.user.id) {
      const user = item.passport.user;
      const sessionId = sessionName[index];
      const { password, ...excludedPasswordUser } = user;
      return { ...excludedPasswordUser, sessionId };
    }
    return;
  });

  const latitude = currentUser?.lat ?? 28.626137;
  const longitude = currentUser?.long ?? 79.821602;

  const haversine = `(
    6371 * acos(
        cos(radians(${latitude}))
        * cos(radians(lat))
        * cos(radians(long) - radians(${longitude}))
        + sin(radians(${latitude})) * sin(radians(lat))
    )
)`;

  const users = await knex("users")
    .select("id", knex.raw(`${haversine} as distance`))
    .orderBy("distance", "ASC");

  let sortedLoggedUser = [];
  let indexes = [];

  for (let index = 0; index < loggedUsers.length; index++) {
    for (let j = 0; j < users.length; j++) {
      if (
        users[j]?.id == loggedUsers[index]?.id &&
        sortedLoggedUser.length < 5
      ) {
        sortedLoggedUser.push(loggedUsers[index]);
        indexes.push(j);
      }
    }
  }

  for (let i = 0; i < indexes.length; i++) {
    for (j = i + 1; j < indexes.length - i - 1; j++) {
      if (indexes[j] > indexes[j + 1]) {
        var temp = sortedLoggedUser[j];
        sortedLoggedUser[j] = sortedLoggedUser[j + 1];
        sortedLoggedUser[j + 1] = temp;
      }
    }
  }
  // console.log(req.session, "sessions");
  res.status(200).send(sortedLoggedUser);
};

// Registering the user
const userRegister = async (req, res) => {
  const { email, zipcode } = req.body;
  if (!email || !zipcode) {
    return helper.handleResponse(res, 400, "bad request");
  }

  let headersList = {
    Accept: "*/*",
  };
  let response = await fetch(
    `${positionPath}?access_key=${process.env.POSTIONSTACK_ACCESS_KEY}&query=${zipcode}&limit=1`,
    {
      method: "GET",
      headers: headersList,
    }
  );
  let data = await response.json();
  req.body.lat = data.data[0]?.latitude ?? 10000;
  req.body.long = data.data[0]?.longitude ?? 10000;

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

// login User
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

// Updating user detail
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

// Logout User
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
