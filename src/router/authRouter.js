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
          expiresIn: "3d",
        }
      );

      userData.verificationToken = verificationToken;
      await userData.save();

      const verificationLink = `${process.env.BASE_URL}/auth/api/useremailverification/${verificationToken}`;
      await sendVerificationMail(email, verificationLink);
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

    } 
    
    if (!user.isVerified) {
      return res.status(403).send({
        status: "error",
        message: "Please verify your email to access your account.",
      });
    }
    
    else {
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
        data: { username: user.name, userId:user._id,token },
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

// EMAIL VERIFICATION
router.get("/api/useremailverification/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);
    const { _id } = decoded;

    // Find user with the _id and matching token
    const user = await findUser({ _id });

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).send({
        status: "success",
        message: "Your email is already verified.",
      });
    }

    if (user.verificationToken !== token) {
      return res.status(400).send({
        status: "error",
        message: "Invalid or expired verification token.",
      });
    }

    // Update verification status
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.status(200).send({
      status: "success",
      message: "Your email has been successfully verified!",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      status: "error",
      message: "Invalid or expired verification link.",
      error: error.message,
    });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUser({ email });

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).send({
        status: "error",
        message: "Email is already verified.",
      });
    }

    // Generate a new token
    const verificationToken = jwt.sign(
      { _id: user._id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "3d",
      }
    );

    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `${process.env.BASE_URL}/auth/api/useremailverification/${verificationToken}`;

    await sendVerificationMail(email, verificationLink);

    return res.status(200).send({
      status: "success",
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "error",
      message: "Could not resend verification email.",
      error: error.message,
    });
  }
});



export default router;
