import e from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = e();
const port = process.env.PORT;

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://authentication-system-orpin.vercel.app"],
    credentials: true,
  }),
);

app.use(e.json());

app.get("/", (req, res) => {
  res.send("Everything's Good");
});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log("Backend Started on", port);
});
