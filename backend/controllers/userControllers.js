import User from "../models/User.js";
import { generateToken } from "./authController.js";

export const userInformation = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if(!user.isVerified){
      return res.status(400).json({ message: "User not verified" });
    }

    res.cookie("token", generateToken(user), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Got user!",
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message });
  }
};
