const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();
const port = 7000;

const routeConfig = require("./routes/index");
const passport = require("./utils/auth/local");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);

routeConfig(app);

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
