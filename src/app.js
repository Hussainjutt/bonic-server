// server.js (Your main server file)
import express from "express";
import http from "http";
import * as socketIo from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import colors from "colors";
dotenv.config();

// DB connections
connectDB();

const app = express();
const httpServer = http.createServer(app);
const server = new socketIo.Server(httpServer, {
  cors: {
    origin: "*",
  },
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use("/api/v1/admin", adminRoutes);
const port = process.env.PORT || 8080;

httpServer.listen(port, () => {
  console.log(`App running on ${port}`.bgCyan.red);
});

server.on("connection", (socket) => {
  console.log("User connected".green);
});

export const io = server;
