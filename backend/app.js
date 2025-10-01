const express = require("express");
const routes = require("./routes/userRoutes.js");
const morgan = require("morgan");
const cors = require("cors");

// Initialize our server
const app = express();

// To access the data user inputs in form
app.use(express.urlencoded({ extended: false }));
// Tells our express server to add the user submitted data to request object
app.use(express.json());

app.use(morgan("dev"));

// CORS configuration for Next.js frontend - must be before routes
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

app.use("/", routes);

module.exports = app;
