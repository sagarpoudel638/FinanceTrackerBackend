import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionbyID,
  getTransactions,
  updateTransaction,
} from "../models/transactionsSchema.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {getGeminiSuggestion, createGeminiPrompt} from "../utils/helper.js"

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Get all Transactions
router.get("/", authMiddleware, async (req, res) => {
  try {
    let userId  = req.user._id;
    let data = await getTransactions(userId);
    let transactionData = [...data];

    const respObj = {
      status: "success",
      message: "All Transactions fetched",
      data: transactionData,
    };
    return res.status(200).send(respObj);
  } catch (error) {
    const errObj = {
      status: "error",
      message: "Error fetching",
      error: {
        code: 500,
        details: error.message || "Error fetching transactions",
      },
    };
    return res.status(500).send(errObj);
  }
});
router.post("/transaction",authMiddleware, async (req, res) => {
  try {
    //console.log("User:", req.user);
    console.log(req.body)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id; 
    const { title, income, expenses, createdAt } = req.body;
    // if (!title || !income || !createdAt) {
    //   return res.status(400).json({
    //     message: "Missing required fields: title, income, or createdAt",
    //   });
    // }
    const transactionData = await createTransaction({

      userId,
      title,
      income,
      expenses,
      createdAt,
    });
    const respObj = {
      status: "success",
      message: "Transaction Added Successfully!",
    };
    console.log(transactionData);
    res.status(200).send(respObj);
  } catch (error) {
    let errObj = {
      status: "error",
      message: "Error Creating",
      error: {
        code: 500,
        details: error.message || "Error creating transaction",
      },
    };

    res.status(500).send(errObj);
  }
});

// get Transaction by ID
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id,userId);

    const resObj = {
      status: "success",
      message: "Successfully fetched Transaction",
      data: transactionData,
    };
    return res.status(200).send(resObj);
  } catch (error) {
    let errObj = {
      status: "error",
      message: "Error in  fetching Transaction",
    };
    return res.status(500).send(errObj);
  }
});
// Create Transaction


// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id,userId);
    if (!transactionData) {
      const errObj = {
        status: "error",
        message: "Not Found",
        error: {
          code: 400,
          details: "Transaction not found",
        },
      };
      return res.status(404).send(errObj);
    }
    await deleteTransaction(id);
    const respObj = {
      status: "success",
      message: "Transaction Deleted Successfully!",
    };
    return res.status(200).send(respObj);
  } catch (err) {
    console.log(err);
    const errObj = {
      status: "error",
      message: "Error Deleting",
      error: {
        code: 500,
        details: err.message || "Error Deleting Transaction",
      },
    };

    return res.status(500).send(errObj);
  }
});

// Update transactions

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const transactionData = req.body;
    const updatedData = await updateTransaction(id,userId,transactionData);
    const respObj = {
      status: "success",
      message: "Post updated successfully",
    };
    return res.status(200).send(respObj);
  } catch (err) {
    console.log(err);
    const errObj = {
      status: "error",
      message: "Error updating",
      error: {
        code: 500,
        details: err.message || "Error updating transaction",
      },
    };

    return res.status(errObj.error.code).send(errObj);
  }
});
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    let userId  = req.user._id;
    let transactions = await getTransactions(userId);// Pass token
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ message: 'No transaction data available to generate suggestions.' });
    }


    const prompt = createGeminiPrompt(transactions);

   
    const suggestion = await getGeminiSuggestion(prompt);


    res.status(200).json({ suggestion });

  } catch (error) {
    console.error('Error generating financial suggestions:', error);
    res.status(500).json({ message: 'Failed to generate financial suggestions', error: error.message });
  }
});

export default router;
