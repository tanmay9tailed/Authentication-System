import express from "express";
import { userInformation } from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect,userInformation)

export default router;
