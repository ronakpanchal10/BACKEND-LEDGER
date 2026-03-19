const BankTransactionModel = require("../models/bankTransaction.model")

const getMiniStatementData = async (accountId) => {
    const transactions = await BankTransactionModel.find({
        $or: [
            { fromAccount: accountId },
            { toAccount: accountId }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("fromAccount", "accountNumber")
    .populate("toAccount", "accountNumber")

    return transactions
}

module.exports = getMiniStatementData