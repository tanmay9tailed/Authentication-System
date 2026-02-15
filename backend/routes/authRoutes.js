import express from "express";
import { signup, login, resendOtp, verifyOtp, forgotPassword} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);

export default router;
