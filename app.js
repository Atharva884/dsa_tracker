const express = require("express");
const routes = require("./routes/userRoutes.js");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

// Initialize our server
const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
app.use(
  session({
    secret: process.env.JWTSECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONNECTION_STRING,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60, // 30 days in seconds
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
    },
  })
);

// To access the data user inputs in form
app.use(express.urlencoded({ extended: false }));
// Tells our express server to add the user submitted data to request object
app.use(express.json());

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cors());
app.use("/", routes);

module.exports = app;
