const { ObjectID } = require("bson");
const { response } = require("express");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const uuid = require("uuid");
const collection = require("../config/collection");
const adminHelper = require("../helper/Helper");
const db = require("../config/db");
const fs = require("fs");
const { validateVegitable } = require("../middleware/adminMidleware");

// mail validator
const { mailValidate } = require("../middleware/emailValidator");
const { resolve } = require("path");

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
  upload.single("profilePicture"),
  mailValidate,
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
        res
          .status(200)
          .json({ status: true, body: "data inserted to database" });
      } else {
        res
          .status(404)
          .json({ status: false, body: `can't insert data into db` });
      }
    });
  }
);

// update user info
router.patch("/update-user/:userID", mailValidate, async (req, res) => {
  let userID = req.params.userID;
  let userData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userType: req.body.userType,
    email: req.body.email,
    password: req.body.password,
  };

  adminHelper
    .updateUserInfo({ userData, userID })
    .then((response) => {
      if (response.status) {
        res.status(200).json({ status: true, body: `user profile upodated` });
      }
    })
    .catch((response) => {
      res.status(404).json({
        status: false,
        body: `can't update user profile info please provided details`,
      });
    });
});

// update user profile picture
router.post(
  "/update-profile/:userID",
  upload.single("profilePicture"),
  async (req, res) => {
    console.log(req.file);
    let userID = req.params.userID;
    let userInfo = await adminHelper.getSingleUser(userID);
    if (userInfo) {
      console.log(userInfo.profilePicture);

      let image = `./public${userInfo.profilePicture}`;
      fs.unlink(image, (err) => {
        if (err) {
          res
            .status(400)
            .json({ status: false, body: `please check provide details` });
        } else {
          console.log("abd");
          let profilePicture = `/profile/${req.file.filename}`;
          adminHelper
            .updateProfile({ profilePicture, userID })
            .then((response) => {
              res
                .status(200)
                .json({ status: true, body: "profile photo updated" });
            })
            .catch((response) => {
              res
                .status(400)
                .json({ status: false, body: "profile photo not update" });
            });
        }
      });
    } else {
      res
        .status(400)
        .json({ status: false, body: "userid not match with our record" });
    }
  }
);

// delete user profile
router.delete(`/delete-user/:userID`, async (req, res) => {
  let userID = req.params.userID;
  let user = await adminHelper.getSingleUser(userID);

  adminHelper
    .deleteUser(userID)
    .then(async (response) => {
      console.log(response);
      if (user) {
        let image = `./public${user.profilePicture}`;
        adminHelper
          .deleteImage(image)
          .then((response) => {
            res.status(200).json({ status: true, body: "user info deleted" });
          })
          .catch((response) => {
            res.status(400).json({ status: false, body: "can't delete image" });
          });
      } else {
        res.status(400).json({ status: false, body: `userId not exist` });
      }
    })
    .catch((response) => {
      res
        .status(400)
        .json({ status: false, body: "user id not match with our record" });
    });
});

// user info pagination
router.get("/user-info", async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  console.log(page, limit);
  let result = await adminHelper.getUserInfo({ page, limit });
  res.json({ status: true, body: result });
});

// add vegitable
router.post(`/add-vegitable`, validateVegitable, (req, res) => {
  adminHelper.addVegitable(req.body).then((response) => {
    res.status(200).json({ status: true, body: `data inserted to db` });
  });
});

// get all vegiables
router.get("/vegitables", (req, res) => {
  adminHelper.getAllVegitables().then((response) => {
    console.log(response);
    res.status(200).json({ status: true, body: response });
  });
});

// get single vegitable
router.get("/get-vegitable/:vegID", async (req, res) => {
  adminHelper
    .getSingleVegitable(req.params.vegID)
    .then((response) => {
      res.status(200).json({ status: true, body: response });
    })
    .catch((response) => {
      res.status(400).json({ status: true, body: `vegitable id is not valid` });
    });
});

// update vegitable info
router.patch(`/update-vegitable/:vegID`, validateVegitable, (req, res) => {
  let data = req.body;
  let vegID = req.params.vegID;
  adminHelper
    .updateVegitable({ vegID, data })
    .then((response) => {
      if (response) {
        res.status(200).json({ status: true, body: response });
      }
    })
    .catch(() => {
      res.status(400).json({ status: false, body: `vegitable id not match` });
    });
});

// delete
router.delete("/delete-vegitable/:vegID", (req, res) => {
  adminHelper
    .deleteSingleVegitable(req.params.vegID)
    .then((response) => {
      console.log(response);
      res.status(200).json({ status: true, body: `vegitable deleted` });
    })
    .catch((response) => {
      res
        .status(400)
        .json({ status: false, body: `can't delet please check vegitable id` });
    });
});

module.exports = router;
