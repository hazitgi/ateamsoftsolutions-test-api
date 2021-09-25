const JwtStraregy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const db = require("./db");

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

module.exports = (passport) => {
  passport.use(
    new JwtStraregy(opts, (jwt_payload, done) => {
      console.log(jwt_payload);
      db.get()
        .collection("user")
        .findOne({ _id: jwt_payload.id })
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
};


