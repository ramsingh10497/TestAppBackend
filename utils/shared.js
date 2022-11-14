const jwt = require("jsonwebtoken");
const multer = require('multer');

const DIR = './public/';

function handleResponse(res, code, statusMsg) {
  res.status(code).json({ status: statusMsg });
}

function handleResponseWithData (res, code, data) {
  res.status(code).json(data);
}

function jwtTokenCreation(payload) {
  return jwt.sign(payload, "random string");
}

// file upload Processess
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, DIR);
  },
  filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, file.fieldname + '-' + fileName)
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
  }
});

module.exports = {
  handleResponse,
  handleResponseWithData,
  jwtTokenCreation,
  upload
};
