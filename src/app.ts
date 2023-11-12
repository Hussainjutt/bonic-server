import express from "express";
import http from "http";
import * as socketIo from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import notificationsRoutes from "./routes/notificationRoutes.ts";

dotenv.config();

// DB connections
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new socketIo.Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Socket connection setup
io.on("connection", (socket) => {
  console.log("User connected successfully");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin", notificationsRoutes);

// Start server
const port = process.env.PORT || 8080;

httpServer.listen(port, () => {
  console.log(`App running on ${port}`);
});

export { io };
