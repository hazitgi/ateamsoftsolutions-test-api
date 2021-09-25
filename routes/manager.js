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

const { verifyToken } = require("../config/token");

const { resolve } = require("path");
const { validateRegisterInput } = require("../Validation/validation");

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

// add vegitable
router.post(`/add-vegitable`, verifyToken, validateVegitable, (req, res) => {
  adminHelper.addVegitable(req.body).then((response) => {
    res.status(200).json({ status: true, body: `data inserted to db` });
  });
});

// get all vegiables
router.get("/vegitables", verifyToken, (req, res) => {
  adminHelper.getAllVegitables().then((response) => {
    console.log(response);
    res.status(200).json({ status: true, body: response });
  });
});

// get single vegitable
router.get("/get-vegitable/:vegID", verifyToken, async (req, res) => {
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
router.patch(
  `/update-vegitable/:vegID`,
  verifyToken,
  validateVegitable,
  (req, res) => {
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
  }
);

// delete
router.delete("/delete-vegitable/:vegID", verifyToken, (req, res) => {
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
