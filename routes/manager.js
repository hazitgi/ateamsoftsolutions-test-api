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
      res.status(400).json({status:false, body:`vegitable id not match`})
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

