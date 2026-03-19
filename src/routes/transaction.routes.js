const express = require("express")
const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

// POST /api/transaction/
router.post("/",authMiddleware,transactionController.createTransaction)

// GET ALL /api/transaction/
router.get("/",authMiddleware,transactionController.getTransactions)

// GET ONE /api/transaction/_id
router.get("/:id",authMiddleware,transactionController.getTransactionById)

// PUT ALL /api/transaction/_id
router.put("/:id",authMiddleware,transactionController.putTransaction)

// PATCH ONE /api/transaction/_id
router.patch("/:id",authMiddleware,transactionController.patchTransaction)

// DELETE /api/transaction/_id
router.delete("/:id",authMiddleware,transactionController.deleteTransaction)

module.exports = router
 