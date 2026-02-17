import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import nodemailer from "nodemailer";
// import { google } from "googleapis";

// const OAuth2 = google.auth.OAuth2;

// const oauth2Client = new OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN,
// });

// const accessToken = await oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAUTH2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    // accessToken: accessToken.token,
  },
});

// const transporter = nodemailer.createTransport({
//   host: "74.125.140.108",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

export const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const generateDate = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpire: generateDate(),
    });

    try {
      const info = await transporter.sendMail({
        from: '"Auth System" <no-reply@auth.com>',
        to: email,
        subject: "OTP",
        text: `Your OTP is ${otp}. Expires in 10 min`,
        html: ` <p>${otp}</p>`,
      });
      console.log("Message sent:", info.messageId);
      // console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.log("Mail error", error);
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Signup successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (user.isVerified) {
      const token = generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        name: user.name,
      });
    } else {
      res.status(400).json({
        message: "User not verified. Login using otp",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    let token = req.cookies.token;

    let userId = undefined;
    if (token) {
      userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    }

    let user;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = generateDate();
    await user.save();

    try {
      const info = await transporter.sendMail({
        from: '"Auth System" <no-reply@auth.com>',
        to: user.email,
        subject: "Resend OTP",
        text: `Your new OTP is ${otp}. Expires in 10 minutes`,
        html: `<h2>Your new OTP: ${otp}</h2>`,
      });
      console.log("Message sent:", info.messageId);
    } catch (error) {
      console.log("Mail error", error);
    }

    token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "Signup again" });
    }

    if (user.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Account verified successfully", name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user does't exists" });
    }

    const info = await transporter.sendMail({
      from: '"Auth System" <no-reply@auth.com>',
      to: user.email,
      subject: "Password Reset Link",
      text: `Your link http://localhost:5173/reset-password`,
      html: `<h2>Your link: <a href="http://localhost:5173/reset-password">click here</a></h2> <h3>Expire in 10 mins.</h3>`,
    });

    user.resetLinkExpire = generateDate();
    await user.save();

    console.log("Message sent:", info.messageId);

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "reset link sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "passwords are not same" });
    }

    const userId = req.userId;

    const user = await User.findById(userId);

    if (user.resetLinkExpire < new Date()) {
      return res.status(400).json({ message: "link expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetLinkExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const check = async (req, res) => {
  try {
    const token = req.cookies.token;

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "User Logged", loggedIn: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
