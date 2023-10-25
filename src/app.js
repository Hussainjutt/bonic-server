import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoutes.js";
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
app.use("/api/v1/admin", adminRoutes);
