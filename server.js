// import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectMongoDB } from "./src/config/dbConfig.js";

// get config file
import { config } from "./src/config/config.js";
import authRouter from "./src/router/authRouter.js";

const app = express();
const PORT = config.port;

connectMongoDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
    response.send("Finance Tracker Api");
  });

app.use("/api/v1/auth", authRouter);

app.listen(PORT, (error) => {
  error
    ? console.log("ERROR starting API server")
    : console.log("http://localhost:" + PORT + " started");
});
