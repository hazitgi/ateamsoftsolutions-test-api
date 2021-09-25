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
const bcrypt = require("bcrypt");
const { validateRegisterInput } = require("../Validation/validation");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../config/token");

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

router.get("/", verifyToken, (req, res) => {});

// add user
router.post(
  "/add-user",
  upload.single("profilePicture"),
  mailValidate,
  async (req, res) => {
    let hashPassword = await bcrypt.hash(req.body.password, 10);
    let userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType: req.body.userType,
      email: req.body.email,
      password: hashPassword,
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

router.get(`/search/:data`, (req, res) => {
  console.log(req.params.data);
  adminHelper
    .searchData(req.params.data)
    .then((response) => {
      res.status(200).json({ status: true, body: response });
    })
    .catch(() => {
      res.status(404).json({ status: false, body: `data not found` });
    });
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

// login
router.post("/login", async (req, res) => {
  const isValid = await validateRegisterInput(req.body);

  const email = req.body.email;
  const password = req.body.password;
  // console.log(isValid);
  // console.log(req.body);

  if (isValid == "valid") {
    let user = await adminHelper.getUserByEmail(email);
    // console.log(user);
    if (!user) {
      console.log(`no user`);
      return res.status(404).json({ success: true, status: `User not found` });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        console.log("password ok");
        // user matched
        // create JWT payload
        const payload = {
          id: user._id,
          name: user.firstName,
        };

        // sign token
        jwt.sign(payload, "secret", { expiresIn: 3600000 }, (err, token) => {
          res.json({
            success: true,
            status: `Login was a success`,
            token: `Bearer ${token}`,
          });
        });
      } else {
        console.log("err");
        return res
          .status(400)
          .json({ status: false, body: `password incorrect` });
      }
    });
  } else {
    res.status(400).json({ success: false, body: isValid });
  }
});

module.exports = router;
