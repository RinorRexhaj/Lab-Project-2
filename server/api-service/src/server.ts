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
import groceryRoutes from "./routes/GroceryRoutes";
import groceryOrderRoutes from "./routes/GroceryOrderRoutes";
import rideRoutes from "./routes/RideRoutes";
import fileRoutes from "./routes/FileRoutes";
import paymentRoutes from "./routes/PaymentRoutes";

// SHTO KETU IMPORTIN PËR UTILITY PAYMENT ROUTES:
import utilityPaymentRoutes from "./routes/utilityPaymentRoutes";

import { setupSocket } from "./chat/Chat";
import { registerSocketHandlers } from "./Ride/Ride";
import { connectMongo } from "./file-source";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prod = process.env.PROD === "true";
const origin = prod
  ? "https://lab-2-olive.vercel.app"
  : "http://localhost:5173";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: origin,
    methods: ["GET", "POST"],
    credentials: prod,
  },
  transports: [prod ? "polling" : "websocket", "websocket"],
});

app.use(
  cors({
    origin: origin,
    credentials: prod,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/reaction", reactionRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/order", orderRoutes);
app.use("/grocery", groceryRoutes);
app.use("/grocery-order", groceryOrderRoutes);

app.use("/ride", rideRoutes);
app.use("/file", fileRoutes);
app.use("/payment", paymentRoutes);

// SHTO KETU ROUTERIN E UTILITY PAYMENTS:
app.use("/utility-payments", utilityPaymentRoutes);

registerSocketHandlers(io);
setupSocket(io);

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
    await connectMongo();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

export { io, httpServer, app };
startServer();
