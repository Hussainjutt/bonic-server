import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import productsRoutes from "./routes/productRoutes.js";
import cors from "cors";
import bodyParser from "body-parser";
dotenv.config();
//DB connections
connectDB();
//rest Object
const app = express();
app.get("/", (req, res) => {
  res.send({
    message: "hello from server",
  });
});

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
//Get the Port
const port = process.env.PORT || 8080;

//Listen funtiom
app.listen(port, () => console.log(`App running on ${port}`));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", productsRoutes);
