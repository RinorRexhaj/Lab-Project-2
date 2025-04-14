import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/AuthRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is live!");
});

// Routes
app.use("/api/auth", authRoutes);

export default app;
