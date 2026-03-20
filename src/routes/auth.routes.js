const express = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// POST /api/auth/register
router.post("/register",authController.userRegisterController)

// POST /api/auth/verify-otp
router.post("/verify-otp", authController.verifyOTPController)

// POST /api/auth/login
router.post("/login",authController.userLoginController)

// GET /api/auth/me
router.get("/me",authMiddleware, authController.getUserController)

// POST /api/auth/refresh-token
router.post("/refresh-token", authController.refreshTokenController);

// POST /api/auth/logout
router.post("/logout", authMiddleware, authController.logoutController)

module.exports = router 