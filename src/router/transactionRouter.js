import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionbyID,
  getTransactions,
  updateTransaction,
} from "../models/transactionsSchema.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { getGeminiSuggestion, createGeminiPrompt } from "../utils/helper.js";

const router = express.Router();

// Get all transactions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await getTransactions(userId);
    return res.status(200).send({
      status: "success",
      message: "All Transactions fetched",
      data: [...data],
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching transactions",
      error: { code: 500, details: error.message },
    });
  }
});

// Create transaction
router.post("/transaction", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, income, expenses, createdAt } = req.body;
    await createTransaction({ userId, title, income, expenses, createdAt });
    return res.status(201).send({
      status: "success",
      message: "Transaction Added Successfully!",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error Creating",
      error: { code: 500, details: error.message },
    });
  }
});

// AI Suggestions — defined BEFORE /:id so Express doesn't treat "suggestions" as an ID
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await getTransactions(userId);

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        suggestion: "No transactions found. Add some income and expense records to get personalised suggestions.",
      });
    }

    const prompt = createGeminiPrompt(transactions);
    const suggestion = await getGeminiSuggestion(prompt);
    return res.status(200).json({ suggestion });
  } catch (error) {
    if (error.message === "AI_QUOTA_EXCEEDED") {
      return res.status(429).json({
        suggestion: "AI suggestions are temporarily unavailable — the daily API quota has been reached. Please try again tomorrow or contact the admin to upgrade the API plan.",
      });
    }
    console.error("Error generating financial suggestions:", error);
    return res.status(500).json({
      suggestion: "Failed to generate suggestions. Please try again later.",
    });
  }
});

// Get transaction by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id, userId);
    return res.status(200).send({
      status: "success",
      message: "Successfully fetched Transaction",
      data: transactionData,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching Transaction",
      error: { code: 500, details: error.message },
    });
  }
});

// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id, userId);
    if (!transactionData) {
      return res.status(404).send({
        status: "error",
        message: "Not Found",
        error: { code: 404, details: "Transaction not found" },
      });
    }
    await deleteTransaction(id, userId);
    return res.status(200).send({
      status: "success",
      message: "Transaction Deleted Successfully!",
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error Deleting",
      error: { code: 500, details: err.message },
    });
  }
});

// Update transaction
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    await updateTransaction(id, userId, req.body);
    return res.status(200).send({
      status: "success",
      message: "Transaction updated successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error updating",
      error: { code: 500, details: err.message },
    });
  }
});

export default router;
