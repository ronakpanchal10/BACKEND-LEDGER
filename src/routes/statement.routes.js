const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const stmtController = require("../controllers/statement.controller")

// GET /api/statement/getMS/:accountNumber
router.get("/getMS/:accountNumber",authMiddleware,stmtController.getMiniStatement)

// GET /api/statement/sendMS/:accountNumbeR
router.get("/sendMS/:accountNumber",authMiddleware,stmtController.sendMiniStatementEmail)

module.exports = router