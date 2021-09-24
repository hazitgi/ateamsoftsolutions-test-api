const db = require("../config/db");
const COLLECTIONS = require("../config/collection");
const ObjectID = require("mongodb").ObjectId;
const Promise = require("promise");
const { resolve, reject } = require("promise");
const { response } = require("express");
const collection = require("../config/collection");
const fs = require("fs");

module.exports = {
  addUser: (data) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(COLLECTIONS.USER_COLLECTION)
        .insertOne(data)
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          reject();
        });
    });
  },

  updateUserInfo: ({ userData, userID }) => {
    console.log("abc");
    return new Promise((resolve, reject) => {
      console.log("userData,,,userData", userData);
      db.get()
        .collection(COLLECTIONS.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userID) },
          {
            $set: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              userType: userData.userType,
              email: userData.email,
              password: userData.password,
            },
          }
        )
        .then((response) => {
          console.log(response.modifiedCount);
          if (response.modifiedCount === 0) {
            reject({ status: false });
          } else {
            resolve({ status: true });
          }
        });
    });
  },

  // get single user info
  getSingleUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      let userInfo = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectID(userID) });
      resolve(userInfo);
    });
  },

  // update user profile
  updateProfile: ({ profilePicture, userID }) => {
    console.log(userID);
    console.log(profilePicture);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userID) },
          {
            $set: {
              profilePicture: profilePicture,
            },
          }
        )
        .then((response) => {
          if (response.modifiedCount === 1) {
            resolve({ status: true });
          } else {
            reject({ status: false });
          }
        });
    });
  },

  // delete user profile
  deleteUser: (userID) => {
    console.log("delete id");
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: ObjectID(userID) })
        .then((response) => {
          console.log(response);
          if (response.deletedCount === 1 && response.acknowledged) {
            console.log("sdf");
            console.log(response.deletedCount);
            resolve({ status: true });
          } else {
            reject({ status: false });
          }
        });
    });
  },

  // delete image
  deleteImage: (image) => {
    return new Promise(async (resolve, reject) => {
      fs.unlink(image, (err) => {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log(`image deleted`);
          resolve();
        }
      });
    });
  },

  // add vegitable
  addVegitable: (data) => {
    let vegitable = {
      name: data.name,
      price: parseInt(data.price),
      color: data.color,
    };
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.VEGITABLE_COLLECTION)
        .insertOne(vegitable)
        .then((response) => {
          resolve();
        });
    });
  },

  // get all vegitable
  getAllVegitables: () => {
    return new Promise(async (resolve, reject) => {
      let vegitables = await db
        .get()
        .collection(collection.VEGITABLE_COLLECTION)
        .find()
        .toArray();
      resolve(vegitables);
    });
  },

  // get single vegitable
  getSingleVegitable: (vegID) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.VEGITABLE_COLLECTION)
        .findOne({ _id: ObjectID(vegID) });
      if (data) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

  // update vegitable info
  updateVegitable: ({ vegID, data }) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VEGITABLE_COLLECTION)
        .updateOne(
          { _id: ObjectID(vegID) },
          {
            $set: {
              name: data.name,
              price: parseInt(data.price),
              color: data.color,
            },
          }
        )
        .then(async (data) => {
          let veg = await db
            .get()
            .collection(collection.VEGITABLE_COLLECTION)
            .findOne({ _id: ObjectID(vegID) });
          if (veg) {
            resolve(veg);
          } else {
            reject();
          }
        });
    });
  },

  // delete vegitabl
  deleteSingleVegitable: (vegID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.VEGITABLE_COLLECTION)
        .deleteOne({ _id: ObjectID(vegID) })
        .then((response) => {
          if (response.deletedCount) {
            resolve();
          } else {
            reject();
          }
        });
    });
  },

  // user info
  getUserInfo: ({ page, limit }) => {
    const skipIndex = (page - 1) * limit;
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .find({}, { profilePicture: 0 })
        .sort({ firstName: 1, lastName: 1, userType: 1 })
        .skip(skipIndex)
        .limit(limit)
        .toArray()
        .then((result) => {
          console.log(result);
          resolve(result);
        });
    });
  },
};
