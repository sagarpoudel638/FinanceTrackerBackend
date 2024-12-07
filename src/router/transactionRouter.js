import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionbyID,
  getTransactions,
  updateTransaction,
} from "../models/transactionsSchema.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Get all Transactions
router.get("/", authMiddleware, async (req, res) => {
  try {
    let data = await getTransactions();
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
        details: error.message || "Erro fetching transactions",
      },
    };
    return res.status(500).send(errObj);
  }
});

// get Transaction by ID
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id);

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
router.post("/transaction", async (req, res) => {
  try {
    const { title, income, expenses, createdAt } = req.body;
    // if (!title || !income || !createdAt) {
    //   return res.status(400).json({
    //     message: "Missing required fields: title, income, or createdAt",
    //   });
    // }
    const transactionData = await createTransaction({
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

// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const transactionData = await getTransactionbyID(id);
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
    const { id } = req.params;
    const transactionData = req.body;
    const updatedData = await updateTransaction(id, transactionData);
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
export default router;
