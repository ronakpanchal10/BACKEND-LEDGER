const accountModel = require("../models/account.model")
const BankTransactionModel = require("../models/bankTransaction.model")
const generateAccountNumber = require("../services/accNumber")

const createAccount = async (req, res) => {
    try {

        const existing = await accountModel.findOne({
            user: req.userId
        })

        if (existing) {
            return res.status(400).json({
                message: "Account already exists"
            })
        }

        const accountNumber = generateAccountNumber()

        const account = await accountModel.create({
            user: req.userId,
            accountNumber,
            balance: 0
        })

        res.status(201).json({
            message: "Account created",
            accountNumber: account.accountNumber,
            balance : account.balance
        })

    } catch (err) {
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const deposit = async (req,res) => {

    try{

        const { accountNumber,amount } = req.body

        if (!accountNumber || !amount) {
            return res.status(400).json({
                message: "accountNumber and amount are required"
            })
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            })
        }

        const account = await accountModel.findOne({
            accountNumber
        })

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        account.balance += amount
        await account.save()

        await BankTransactionModel.create({
            toAccount:account._id,
            amount,
            type:"deposit"
        })

        res.json({
            message:"Deposit Successfully" , 
            balance: account.balance
        })

    }catch(err){
        res.status(500).json({
            message : "Server Error"
        })
    }
}

const withdraw = async (req,res) => {

    try{

        const { accountNumber,amount } = req.body

        if (!accountNumber || !amount) {
            return res.status(400).json({
                message: "accountNumber and amount are required"
            })
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            })
        }
        
        const account = await accountModel.findOne({
            accountNumber
        })

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        if(account.balance < amount) {
            return res.status(400).json({
                message:"Insufficient Balance"
            })
        }

        account.balance -= amount
        await account.save()

        await BankTransactionModel.create({
            fromAccount: account._id,
            amount,
            type:"withdraw"
        })

        res.json({
            message:"Withdraw Successfully",
            balance:account.balance
        })

    }catch(err){
        res.status(500).json({
            message : "Server Error"
        })
    }
}

const transfer = async (req, res) => {
    try {
        const { fromAccountNumber,toAccountNumber, amount } = req.body

        const sender = await accountModel.findOne({ accountNumber: fromAccountNumber})
        const receiver = await accountModel.findOne({ accountNumber: toAccountNumber })

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Account not found" })
        }

        if (sender.accountNumber === toAccountNumber) {
            return res.status(400).json({ message: "Cannot transfer to same account" })
        }

        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" })
        }

        sender.balance -= amount
        receiver.balance += amount

        await sender.save()
        await receiver.save()

        const txn = await BankTransactionModel.create({
            fromAccount: sender._id,
            toAccount: receiver._id,
            amount,
            type: "transfer"
        })

        await txn.populate("fromAccount", "accountNumber")
        await txn.populate("toAccount", "accountNumber")

        res.json({
            message: "Transfer successful",
            transaction: txn
        })

    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

const getBalance = async (req, res) => {
    try {

        const { accountNumber } = req.params

        const account = await accountModel.findOne({
            accountNumber
        })

        if (!account) {
            return res.status(404).json({
                message: "Account not found."
            })
        }

        res.json({ accountNumber,balance: account.balance })

    } catch (err) {
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const getTransactions = async (req, res) => {
    try {
        const { accountNumber } = req.params

        const account = await accountModel.findOne({ accountNumber })

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        const transactions = await BankTransactionModel.find({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
            ]
        })
        .populate("fromAccount", "accountNumber")
        .populate("toAccount", "accountNumber")

        res.json(transactions)

    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = {
    createAccount,
    deposit,
    withdraw,
    transfer,
    getBalance,
    getTransactions
}