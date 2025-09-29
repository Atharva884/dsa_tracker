const express = require("express");
const routes = require("./routes/router.js");
const morgan = require("morgan");

const cors = require("cors");


//imports here


//code here

// Initialize our server
const app = express();
//To access the data user inputs in form.
app.use(express.urlencoded({ extended: false }));
//just a bolierplate code, tells our express server to add the user submitted data to request object.
app.use(express.json());

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cors());
app.use("/", routes);
module.exports = app;