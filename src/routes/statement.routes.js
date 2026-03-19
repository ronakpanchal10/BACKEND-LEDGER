const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const stmtController = require("../controllers/statement.controller")

router.get("/getMS/:accountNumber",authMiddleware,stmtController.getMiniStatement)
router.get("/sendMS/:accountNumber",authMiddleware,stmtController.sendMiniStatementEmail)

module.exports = router