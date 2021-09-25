const fs = require("fs");
const path = require("path");

module.exports.mailValidate = (req, res, callback) => {

  
  let email = req.body.email.split("@");
  let mails = fs
    .readFileSync(path.join(__dirname, "mail.txt"), { encoding: "utf-8" })
    .split("\n");
  let flag;
  for (let i = 0; i < mails.length; i++) {
    if (email[1] === mails[i]) {
      flag = true;
      break;
    }
  }
  if (flag) {
    callback();
  } else {
    if (req.file) {
      let image = `${req.file.destination}${req.file.filename}`;
      fs.unlink(image, (err) => {
        res.status(400).json({ status: false, body: "not acceptable email" });
      });
    } else {
      res.status(400).json({ status: false, body: "not acceptable email" });
    }
  }
};
