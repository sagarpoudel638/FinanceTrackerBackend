import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  income: {
    type: Number,
    default: 0,
  },
  expenses: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Transactions = mongoose.model("transactions", transactionsSchema);

export const getTransactions = async (userId) => {
  return await Transactions.find({ userId });
};

export const createTransaction = async (transaction) => {
  const newTransaction = new Transactions(transaction);
  return await newTransaction.save();
};

export const getTransactionbyID = async (id, userId) => {
  return await Transactions.findOne({ _id: id, userId });
};

export const deleteTransaction = async (id, userId) => {
  return await Transactions.findByIdAndDelete(id, userId);
};

export const updateTransaction = async (id, userId, updateData) => {
  const data = await Transactions.findByIdAndUpdate(
    { _id: id, userId },
    {
      $set: updateData,
    },
    { new: true }
  );
  return data;
};
