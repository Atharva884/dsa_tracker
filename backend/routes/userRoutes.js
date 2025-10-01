const express = require("express");
const router = express.Router();
const AuthHelper = require("../helper/JWTAuthHelper");
const TryCatch = require("../helper/TryCatch");
const Messages = require("../constants/Message");
const userController = require("../controllers/userController");
const problemController = require("../controllers/problemController");
const upload = require("../config/multerConfig");

// ============= API ROUTES (JWT-based) =============

// Public Routes - Authentication
router.post(
  "/api/register",
  new TryCatch(userController.apiRegister).tryCatchGlobe()
);
router.post(
  "/api/login",
  new TryCatch(userController.apiLogin).tryCatchGlobe()
);

// Protected Routes - Problems
router.post(
  "/api/upload-problems",
  AuthHelper.verifyToken,
  upload.single("excelFile"),
  new TryCatch(problemController.apiUploadProblems).tryCatchGlobe()
);
router.get(
  "/api/my-problems",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiGetMyProblems).tryCatchGlobe()
);
router.get(
  "/api/problem-stats",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiGetStats).tryCatchGlobe()
);
router.get(
  "/api/generate-problems",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiGenerateProblems).tryCatchGlobe()
);
router.post(
  "/api/mark-done",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiMarkAsDone).tryCatchGlobe()
);
router.post(
  "/api/reset-cycle",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiResetCycle).tryCatchGlobe()
);
router.post(
  "/api/delete-all-problems",
  AuthHelper.verifyToken,
  new TryCatch(problemController.apiDeleteAllProblems).tryCatchGlobe()
);

// Protected Routes - User Management
router.post(
  "/api/does-email-exists",
  AuthHelper.verifyToken,
  new TryCatch(userController.doesEmailExist).tryCatchGlobe()
);
router.get(
  "/api/get-by-id/:id",
  AuthHelper.verifyToken,
  new TryCatch(userController.getById).tryCatchGlobe()
);
router.get(
  "/api/get-by-email/:email",
  AuthHelper.verifyToken,
  new TryCatch(userController.getByEmail).tryCatchGlobe()
);
router.get(
  "/api/get-all",
  AuthHelper.verifyToken,
  new TryCatch(userController.getAllUsers).tryCatchGlobe()
);
router.delete(
  "/api/delete-by-id/:id",
  AuthHelper.verifyToken,
  new TryCatch(userController.deleteById).tryCatchGlobe()
);
router.post(
  "/api/update-by-id/:id",
  AuthHelper.verifyToken,
  new TryCatch(userController.updateById).tryCatchGlobe()
);
router.post(
  "/api/update-by-email/:email",
  AuthHelper.verifyToken,
  new TryCatch(userController.updateByEmail).tryCatchGlobe()
);

// Health check route
router.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "DSA Tracker API is running" });
});

module.exports = router;

module.exports = router;
