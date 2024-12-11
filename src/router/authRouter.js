import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import bcrypt from "bcrypt";
import { createUser } from "../models/userSchema.js";
import { findUser } from "../models/userSchema.js";
import {
  loginValidator,
  signupValidator,
} from "../middleware/joiValidation.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { sendVerificationMail } from "../utils/mailer.js";

const router = express.Router();

// SIGN UP
router.post("/signup", signupValidator, async (req, res) => {
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
      //verfication Token
      const verificationToken = jwt.sign(
        { _id: userData._id, email: userData.email, name: userData.name },
        config.jwtSecret,
        {
          expiresIn: "365d",
        }
      );

      userData.verificationToken = verificationToken;
      await userData.save();
      await sendVerificationMail(email, `url ${verificationToken}`);
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
router.post("/login", loginValidator, async (req, res) => {
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

    const isMatch = await bcrypt.compare(password, user.password);
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
      const token = jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        config.jwtSecret,
        {
          expiresIn: config.jwtExpire,
        }
      );
      const respObj = {
        status: "success",
        message: "Login Successful",
        data: { user: user.name, token },
      };
      console.log(respObj);
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

router.get("/verify", authMiddleware, async (req, res) => {
  const respObj = {
    status: "success",
    message: "Verified",
    data: { user: req.user.name },
  };

  return res.status(200).send(respObj);
});

export default router;
