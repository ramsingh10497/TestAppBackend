const passport = require("passport");
const knex = require("../../config/db");

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log("comes in serializer")
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  });

  passport.deserializeUser((id, done) => {
    knex("users")
      .where({ id })
      .first()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
