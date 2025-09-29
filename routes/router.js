const express = require('express');
const router = express.Router();

//imports here
const userRoutes = require("./userRoutes");

//code here
router.use("/", userRoutes); // All routes (Web + API)

router.get("/health-check", (req,res)=>{
  res.json("Server Health: OK");
})

module.exports = router;