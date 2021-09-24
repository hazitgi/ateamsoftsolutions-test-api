const { response } = require("express");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const uuid = require("uuid");
const adminHelper = require("../helper/adminHelper");

// mail validator
const { mailValidate } = require("../middleware/emailValidator");

//  multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profile/");
  },
  filename: function (req, file, cb) {
    let profile = file.originalname.split(".");
    let extension = profile[profile.length - 1];
    cb(null, `${uuid.v4()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {});

// add user
router.post(
  "/add-user",
  mailValidate,
  upload.single("profilePicture"),
  (req, res) => {
    let userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType: req.body.userType,
      email: req.body.email,
      password: req.body.password,
      profilePicture: `/profile/${req.file.filename}`,
    };
    adminHelper.addUser(userData).then((response) => {
      if (response) {
        res.status(200).json({ status: true });
      } else {
        res.status(404).json({ status: false });
      }
    });
  }
);

module.exports = router;
