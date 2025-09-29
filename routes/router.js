const express = require('express');
const router = express.Router();

//imports here
const userRoutes = require("./userRoutes");

//code here
router.use("/user", userRoutes);
router.get("/health-check", (req,res)=>{
  res.json("Server Health: OK");
})

module.exports = router;