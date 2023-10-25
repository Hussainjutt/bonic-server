import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const username = "hussainahmaddev";
    const password = "Hussain@123";
    const host = "cluster1.fti61v8.mongodb.net";
    const database = "e-commerce";
    const uri = `mongodb+srv://${encodeURIComponent(
      username
    )}:${encodeURIComponent(
      password
    )}@${host}/${database}?retryWrites=true&w=majority`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB connected successfully");
  } catch (error) {
    connectDB();
  }
};

export default connectDB;
