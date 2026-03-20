const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const bankController = require("../controllers/banking.controller")

// POST /api/bank/createAccount
router.post("/createAccount",authMiddleware,bankController.createAccount)

// POST /api/bank/deposit
router.post("/deposit",authMiddleware,bankController.deposit)

// POST /api/bank/withdraw
router.post("/withdraw",authMiddleware,bankController.withdraw)

// POST /api/bank/transfer
router.post("/transfer",authMiddleware,bankController.transfer)

// GET /api/bank/balance/:accountNumber
router.get("/balance/:accountNumber",authMiddleware,bankController.getBalance)

// GET /api/bank/transaction/:accountNumber
router.get("/transaction/:accountNumber",authMiddleware,bankController.getTransactions)

module.exports = router