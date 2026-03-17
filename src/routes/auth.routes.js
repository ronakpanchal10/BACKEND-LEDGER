const express = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// post /api/auth/register
router.post("/register",authController.userRegisterController)

//post /api/auth/verify-otp
router.post("/verify-otp", authController.verifyOTPController)

// post /api/auth/login
router.post("/login",authController.userLoginController)

// GET /api/auth/me
router.get("/me", authController.getUserController)

// POST /api/auth/logout
router.post("/logout", authMiddleware, authController.logoutController)

module.exports = router