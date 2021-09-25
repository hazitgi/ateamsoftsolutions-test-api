const ObjectID = require('mongodb').ObjectId
const jwt = require("jsonwebtoken");
const collection = require("./collection");
const db = require('./db')

module.exports ={
    verifyToken: (req, res, next) => {
      console.log(req.headers.authorization)

      let cookie = (req.headers.authorization).split(' ')[1] 
      console.log(cookie);
      if (cookie == undefined) {
        res.status(401).send({ error: "no token provided" });
      } else {
        jwt.verify(cookie, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) {
            // res.status(500).send({ error: "Authetication failed" });
            res.status(500).json({ error: "Authetication failed" });
          } else {
            // console.log(decoded.id);
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectID(decoded.id)})
            console.log(user);
            if(user){
                next();
            }else{
                res.status(500).json({ error: "Authetication failed" });
            }
          }
        });
      }
    },
  }