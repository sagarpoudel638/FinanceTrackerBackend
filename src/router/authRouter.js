import { express } from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
   if (password==confirmPassword) {
    const newPassword = password;
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const userData = await createUser({
      name,
      email,
      password: hashedpassword,
    });
    const respObj = {
        status: "success",
        message: "User created successfully!",
      };
      console.log(respObj)
      res.status(200).send(respObj);
   } else {
    console.log("password didnot match")
   }
   
  } catch (error) {}
});
