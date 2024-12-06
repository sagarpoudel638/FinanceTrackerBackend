import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  income: {
    type: Number,
    default:0,
  },
  expenses: {
    type: Number,
    default:0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

export const updateTransaction = async (id, updateData) => {
  const data = await Transactions.findByIdAndUpdate(
    id,{
      $set: updateData,
    },
    {new: true}
  );
  return data;
}