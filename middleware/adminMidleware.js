const isColor = require("is-color");

module.exports = {
  validateVegitable: (req, res, next) => {
    if (req.body.color && req.body.price && req.body.name) {
      if (isColor(req.body.color) && !isNaN(req.body.price)) {
        next();
      } else {
        res
          .status(400)
          .json({ status: false, body: "enter correct color or price" });
      }
    } else {
      res
        .status(400)
        .json({ status: false, body: "please enter all field correctly" });
    }
  },
};
