import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      const respObj = {
        status: false,
        message: "Access denied. No token!",
      };
      return res.status(401).send(respObj);
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const errObj = {
          status: false,
          message: "Token expired! Please log in again.",
        };

        return res.status(401).json(errObj);
      } else {
        const errObj = {
          status: false,
          message: "Invalid Token!",
        };

        return res.status(403).json(errObj);
      }
    }
  } catch (error) {
    return res.json(error);
  }
};

// export const isAdmin = (req, res, next) => {
//   if (req.userdata.role == "admin") {
//     next();
//   } else {
//     const error = { status: "error", message: "unauthorized action" };
//   }
//   return res.json(error);
// };
