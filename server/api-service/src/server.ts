import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./data-source";
import { seedDatabase } from "./seeds/seed";
import authRoutes from "./routes/AuthRoutes";
import userRoutes from "./routes/UserRoutes";
import chatRoutes from "./routes/ChatRoutes";
import reactionRoutes from "./routes/ReactionRoutes";
import restaurantRoutes from "./routes/RestaurantRoutes";
import orderRoutes from "./routes/OrderRoutes";
import { setupSocket } from "./chat/Chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/reaction", reactionRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/order", orderRoutes);

setupSocket(io);

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
