const passwordValidator = require("password-validator");
const schema = new passwordValidator();
const fs = require("fs");
const path = require("path");
schema.is().min(8).has().uppercase().has().lowercase().has().digits();

module.exports = {
  validateRegisterInput: (data) => {
    var flag = false;
    let email = data.email;
    let password = data.password;
    const mailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let isValidEmail = mailRegex.test(String(email).toLowerCase());

    let isValidPassword = schema.validate(password);
    // console.log("isValidEmail", isValidEmail);
    // console.log("isValidPassword", isValidPassword);

    let existMail = email.split("@");
    const pathOfMail = "/../middleware/mail.txt";


    if (isValidEmail) {
      let mails = fs
        .readFileSync(__dirname + pathOfMail, { encoding: "utf-8" })
        .split("\n");

      for (let i = 0; i < mails.length; i++) {
        if (existMail[1] === mails[i]) {
          flag = true;
          break;
        }

      }

      if (flag) {

        if (isValidPassword) {
          return `valid`;
        } else {
          return "password) Passwords should be a minimum of 8 letters with a combination of at least one number, one special character, and one Capital letter";
        }
      } else {
        return `wrong email`;
      }
    }
  },
};
