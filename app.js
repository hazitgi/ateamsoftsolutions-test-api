const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const db = require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");


// routes
const admin = require("./routes/admin");
const manager = require("./routes/manager");

db.connect((err) => {
  if (err) {
    console.log(`Db connection error ${err}`.red.underline.bold);
  } else {
    console.log(`DB connected`.cyan.underline.bold);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  app.use(cors());
}

app.use("/api/v1/admin", admin);
app.use("/api/v1/manager", manager);

app.listen(process.env.PORT, (err, done) => {
  if (err) {
    throw err;
  } else {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode
    http://localhost:${PORT}/api/v1/`.yellow.bold
    );
  }
});
