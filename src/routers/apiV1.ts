import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import internshipRouter from "./internship.js";
import applicationRouter from "./application.js";
import { forgotPassword, resetPassword } from "../controllers/recoverPassword.js";
import signup from "../controllers/signup.js";

const router = Router();

router.use("/auth", authRouter);
router.post("/signup", signup);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

router.use("/users", userRouter);
router.use("/internships", internshipRouter);
router.use("/applications", applicationRouter);


export default router;