import express from "express";
import { Logout, userInformation } from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, userInformation)
router.post("/logout", protect, Logout)

export default router;
