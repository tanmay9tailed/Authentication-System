import express from "express";
import { signup, login, resendOtp, verifyOtp, forgotPassword, resetPassword} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", protect,verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", protect, resetPassword);

export default router;
