const express = require('express');
const router = express.Router();
const AuthHelper = require('../helper/JWTAuthHelper');
const SessionAuth = require('../helper/SessionAuthHelper');
const TryCatch = require('../helper/TryCatch');
const Messages = require('../constants/Message');
const userController = require('../controllers/userController');
const problemController = require('../controllers/problemController');
const upload = require('../config/multerConfig');

//imports here

//code here

// ============= WEB ROUTES (Session-based) =============
// Public Routes
router.get("/", (req, res) => res.redirect("/signin"));
router.get("/signin", SessionAuth.requireGuest, userController.showSignIn);
router.get("/signup", SessionAuth.requireGuest, userController.showSignUp);
router.post("/signin", userController.handleSignIn);
router.post("/signup", userController.handleSignUp);
router.get("/logout", userController.handleLogout);

// Protected Routes
router.get("/dashboard", SessionAuth.requireLogin, userController.showDashboard);

// ============= PROBLEM ROUTES (Session-based) =============
router.post("/upload-problems", SessionAuth.requireLogin, upload.single('excelFile'), problemController.uploadProblems);
router.get("/my-problems", SessionAuth.requireLogin, problemController.getMyProblems);
router.get("/problem-stats", SessionAuth.requireLogin, problemController.getStats);
router.get("/generate-problems", SessionAuth.requireLogin, problemController.generateProblems);
router.post("/mark-done", SessionAuth.requireLogin, problemController.markAsDone);
router.post("/reset-cycle", SessionAuth.requireLogin, problemController.resetCycle);
router.post("/delete-all-problems", SessionAuth.requireLogin, problemController.deleteAllProblems);

// ============= API ROUTES (JWT-based) =============
//Entity - User --start
//Authentication - User
router.post('/api/register', new TryCatch(userController.apiRegister).tryCatchGlobe());
router.post('/api/login', new TryCatch(userController.apiLogin).tryCatchGlobe());

//CRUD Operations - User
router.post('/api/does-email-exists', AuthHelper.verifyToken, new TryCatch(userController.doesEmailExist).tryCatchGlobe());
router.get('/api/get-by-id/:id', AuthHelper.verifyToken, new TryCatch(userController.getById).tryCatchGlobe());
router.get('/api/get-by-email/:email', AuthHelper.verifyToken, new TryCatch(userController.getByEmail).tryCatchGlobe());
router.get('/api/get-all', AuthHelper.verifyToken, new TryCatch(userController.getAllUsers).tryCatchGlobe());
router.delete('/api/delete-by-id/:id', AuthHelper.verifyToken, new TryCatch(userController.deleteById).tryCatchGlobe());
router.post("/api/update-by-id/:id", AuthHelper.verifyToken, new TryCatch(userController.updateById).tryCatchGlobe());
router.post("/api/update-by-email/:email", new TryCatch(userController.updateByEmail).tryCatchGlobe());
//Entity - User - End

module.exports = router;