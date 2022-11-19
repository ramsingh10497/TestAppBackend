const bcrypt = require("bcryptjs");
const knex = require("../../config/db");

function createUser(req, res) {
  return handleErrors(req)
    .then(() => {
      const { phone, mobile, zipcode, password } = req.body;
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      return knex("users")
        .insert({
          ...req.body,
          password: hash,
          phone: phone && parseInt(phone),
          mobile: mobile && parseInt(mobile),
          zipcode: zipcode && parseInt(zipcode)
        })
        .returning("*");
    })
    .catch((error) => {
      console.log("comes in catch part in auth.js file", error);
      res.status(400).json(error);
    });
}

const updateUser = (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  const { phone, mobile, zipcode, password } = req.body;
  const salt = bcrypt.genSaltSync();
  const hash = password && bcrypt.hashSync(password, salt);
  try {
    return knex("users")
      .where({ id: req?.params?.id })
      .update({
        ...req.body,
        password: hash,
        phone: phone && parseInt(phone),
        mobile: mobile && parseInt(mobile),
        zipcode: zipcode && parseInt(zipcode),
        picture: req?.file?.filename && url + "/public/" + req.file.filename,
      })
      .returning("*");
  } catch (error) {
    console.log("comes in catch part in auth.js file", error);
    res.status(400).json(error);
  }
};

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function handleErrors(req) {
  return new Promise((resolve, reject) => {
    const { email, password } = req.body;
    if (!email.includes("@")) {
      reject({
        message: "email is not correct",
      });
    } else if (password?.length < 6) {
      reject({
        message: "Password must be longer than 6 characters",
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  createUser,
  comparePass,
  handleErrors,
  updateUser,
};
