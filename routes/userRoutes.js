const express = require('express');
const router = express.Router();
const AuthHelper = require('../helper/JWTAuthHelper');
const TryCatch = require('../helper/TryCatch');
const Messages = require('../constants/Message');
const userController = require('../controllers/userController');

//imports here

//code here

//Entity - User --start
//Authentication - User
router.post('/register', new TryCatch(userController.apiRegister).tryCatchGlobe());
router.post('/login', new TryCatch(userController.apiLogin).tryCatchGlobe());

//CRUD Operations - User
router.post('/does-email-exists', AuthHelper.verifyToken, new TryCatch(userController.doesEmailExist).tryCatchGlobe());
router.get('/get-by-id/:id', AuthHelper.verifyToken, new TryCatch(userController.getById).tryCatchGlobe());
router.get('/get-by-email/:email', AuthHelper.verifyToken, new TryCatch(userController.getByEmail).tryCatchGlobe());
router.get('/get-all', AuthHelper.verifyToken, new TryCatch(userController.getAllUsers).tryCatchGlobe());
router.delete('/delete-by-id/:id', AuthHelper.verifyToken, new TryCatch(userController.deleteById).tryCatchGlobe());
router.post("/update-by-id/:id", AuthHelper.verifyToken, new TryCatch(userController.updateById).tryCatchGlobe());
router.post("/update-by-email/:email", new TryCatch(userController.updateByEmail).tryCatchGlobe());
//Entity - User - End

module.exports = router;