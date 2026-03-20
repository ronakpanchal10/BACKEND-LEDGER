const accountModel = require("../models/account.model")
const sendEmail = require("../services/sendEmail")
const getMiniStatementData = require("../services/miniStmt")
const generateStatementFile = require("../services/statementFile")

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
        const { format } = req.query

        const account = await accountModel.findOne({ accountNumber }).populate("user")

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        const transactions = await getMiniStatementData(account._id)

        // Format message
        let message = `Mini Statement for Account: ${accountNumber}\n\n`

        transactions.forEach((txn, index) => {
            let fromAcc = txn.fromAccount?.accountNumber
            let toAcc = txn.toAccount?.accountNumber

            if (txn.type === "deposit") {
                fromAcc = "BANK"
                toAcc = toAcc || accountNumber
            } 
            else if (txn.type === "withdraw") {
                fromAcc = fromAcc || accountNumber
                toAcc = "BANK"
            } 
            else if (txn.type === "transfer") {
                if (fromAcc === accountNumber) fromAcc = "SELF"
                if (toAcc === accountNumber) toAcc = "SELF"

                fromAcc = fromAcc || "UNKNOWN"
                toAcc = toAcc || "UNKNOWN"
            }

            message += `${index + 1}. ${txn.type.toUpperCase()} | Rs.${txn.amount}\n`
            message += `From: ${fromAcc}\n`
            message += `To: ${toAcc}\n`
            message += `Date: ${txn.createdAt}\n\n`
        })

        message += `Total Balance: Rs.${account.balance}`

        const fileFormat = format || "txt"

        let filePath

        if (fileFormat === "pdf") {
            filePath = await generateStatementFile(
                accountNumber,
                transactions,
                account.balance,
                "pdf"
            )
        } else {
            filePath = await generateStatementFile(
                accountNumber,
                message,
                "txt"
            )
        }

        await sendEmail(
            account.user.email,
            "Mini Statement",
            `Please find attached ${fileFormat.toUpperCase()} statement`,
            filePath
        )

        res.json({
            message: `${fileFormat.toUpperCase()} statement`
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