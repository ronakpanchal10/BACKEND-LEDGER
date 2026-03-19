const accountModel = require("../models/account.model")
const BankTransactionModel = require("../models/bankTransaction.model")
const sendEmail = require("../services/sendEmail")
const getMiniStatementData = require("../services/miniStmt")

const getMiniStatement = async (req,res) => {
    try {
        const { accountNumber } = req.params

        const account = await accountModel.findOne({
            accountNumber
        })

        if (!account) {
            return res.status(404).json({
                message:"Account not found"
            })
        }

        const transactions = await getMiniStatementData(account._id)

        res.json({
            accountNumber,
            miniStatement : transactions
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Server Error"
        })
    }
}

const sendMiniStatementEmail = async (req, res) => {
    try {
        const { accountNumber } = req.params

        const account = await accountModel.findOne({ accountNumber }).populate("user")

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        const transactions = await getMiniStatementData(account._id)

        // ✨ Format message
        let message = `Mini Statement for Account: ${accountNumber}\n\n`

        transactions.forEach((txn, index) => {
            message += `${index + 1}. ${txn.type.toUpperCase()} | ₹${txn.amount}\n`
            message += `From: ${txn.fromAccount?.accountNumber || "-"}\n`
            message += `To: ${txn.toAccount?.accountNumber || "-"}\n`
            message += `Date: ${txn.createdAt}\n\n`
        })

        // 📧 Send Email
        await sendEmail(account.user.email, "Mini Statement", message)

        res.json({
            message: "Mini statement sent to email"
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports = {
    getMiniStatement,
    sendMiniStatementEmail
}