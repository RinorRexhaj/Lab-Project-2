import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./data-source";
import authRoutes from "./routes/AuthRoutes";
import userRoutes from "./routes/UserRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
