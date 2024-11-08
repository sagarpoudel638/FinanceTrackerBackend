import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  income: {
    type: Number,
  },
  expenses: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
export const Transactions = mongoose.model("transactions", transactionsSchema);

export const getTransactions = async () => {
    return await Transactions.find()
}

export const createTransaction = async (transaction) => {
  const newTransaction = new Transactions(transaction);
  return await newTransaction.save();
};

export const getTransactionbyID = async (id) => {
    return await Transactions.findById(id);
}

export const deleteTransaction = async (id) => {
    return await Transactions.findByIdAndDelete(id); 
}

