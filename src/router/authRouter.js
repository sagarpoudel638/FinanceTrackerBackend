import express from "express";
import bcrypt from "bcrypt";
import { createUser } from "../models/userSchema.js";
import { findUser } from "../models/userSchema.js";

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (password == confirmPassword) {
      const newPassword = password;
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(newPassword, salt);

      const userData = await createUser({
        name,
        email,
        password: hashedpassword,
      });
      const respObj = {
        status: "success",
        message: "User created successfully!",
      };
      res.status(200).send(respObj);
    } else {
      let errObj = {
        status: "error",
        message: "Password Did Not Match",
        error: {
          code: 500,
          details: "Password Didnot Match",
        },
      };

      res.status(500).send(errObj);
    }
  } catch (error) {
    let errObj = {
      status: "error",
      message: "Error Creating",
      error: {
        code: 500,
        details: error.message || "Error creating user",
      },
    };

    res.status(500).send(errObj);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUser({ email }, true);
    if (!user) {
      return res.status(401).send({
        status: "error",
        message: "Unauthenticated",
        error: {
          code: 401,
          details: "Invalid email or password",
        },
      });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        status: "error",
        message: "Unauthenticated",
        error: {
          code: 401,
          details: "Invalid email or password",
        },
      });
    } else {
      const respObj = {
        status: "success",
        message: "Login Successful",
        data: {user:user.name},
      };
      console.log(respObj)
      res.status(200).send(respObj);
    }
  } catch (error) {
    let errObj = {
      status: "error",
      message: "Error Login",
      error: {
        code: 500,
        details: error.message || "Error Login user",
      },
    };

    res.status(500).send(errObj);
  }
});

export default router;
