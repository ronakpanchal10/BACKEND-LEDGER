const transactionModel = require("../models/transaction.model")

async function createTransaction (req,res){
    try{

        const {type,amount,note} = req.body
            
        if(!type || !amount){
            return res.status(400).json({
                message:"Type and Amount required"
            })
        }

        const transaction = await transactionModel.create({
            user:req.userId,
            type,
            amount,
            note
        })

        res.status(201).json(transaction)

    }catch(err){

        res.status(500).json({message:"Server Error"})

    }

}

async function getTransactions(req,res){
    try{

        const transactions = await transactionModel.find({
            user:req.userId
        })

        res.status(200).json(transactions)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:"Server Error"
        })

    }
}

// GET TRANSACTION BY ID
async function getTransactionById(req, res) {

    try {

        const { id } = req.params

        const transaction = await transactionModel.findOne({
            _id: id,
            user: req.userId
        })

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            })
        }

        res.status(200).json(transaction)

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Server Error"
        })

    }

}

// Update Transaction ALL
async function putTransaction(req,res){

    try{

        const { id } = req.params
        const { type, amount, note } = req.body

        if(!type || !amount){
            return res.status(400).json({
                message:"Type and Amount required"
            })
        }

        const transaction = await transactionModel.findOneAndUpdate(
            { _id:id, user:req.userId },
            { type, amount, note },
            { returnDocument:"after", runValidators:true }
        )

        if(!transaction){
            return res.status(404).json({
                message:"Transaction not found"
            })
        }

        res.json(transaction)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:"Server Error"
        })

    }

}

// Update Transaction One Filed
async function patchTransaction(req,res){

    try{

        const { id } = req.params
        const updates = req.body

        const transaction = await transactionModel.findOneAndUpdate(
            { _id:id, user:req.userId },
            updates,
            { returnDocument:"after", runValidators:true }
        )

        if(!transaction){
            return res.status(404).json({
                message:"Transaction not found"
            })
        }

        res.json(transaction)

    }catch(err){

        console.log(err)

        res.status(500).json({
            message:"Server Error"
        })

    }

}

// Delete Transaction
async function deleteTransaction(req, res) {
  try {
    const { id } = req.params

    const transaction = await transactionModel.findOneAndDelete({
      _id: id,
      user: req.userId
    })

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      })
    }

    res.status(200).json({
      message: "Transaction deleted successfully"
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Server Error"
    })
  }
}


module.exports = { 
    createTransaction,
    getTransactions,
    getTransactionById,
    patchTransaction,
    putTransaction,
    deleteTransaction
}