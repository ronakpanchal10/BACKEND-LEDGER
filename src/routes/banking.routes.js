const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const bankController = require("../controllers/banking.controller")


router.post("/createAccount",authMiddleware,bankController.createAccount)

router.post("/deposit",authMiddleware,bankController.deposit)
router.post("/withdraw",authMiddleware,bankController.withdraw)
router.post("/transfer",authMiddleware,bankController.transfer)

router.get("/balance/:accountNumber",authMiddleware,bankController.getBalance)
router.get("/transaction/:accountNumber",authMiddleware,bankController.getTransactions)

module.exports = router