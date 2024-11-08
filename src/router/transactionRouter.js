import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionbyID,
  getTransactions,
} from "../models/transactionsSchema.js";

const router = express.Router();

// Get all Transactions
router.get("/", async (req, res) => {
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
router.get("/:id", async (req, res) => {
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
    const { title, income, expenses } = req.body;
    const transactionData = await createTransaction({
      title,
      income,
      expenses,
    });
    const respObj = {
      status: "success",
      message: "Transaction Added Successfully!",
    };
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
router.delete("/:id", async (req, res) => {
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
export default router;
