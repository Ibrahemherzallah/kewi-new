import mongoose from "mongoose"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI)
    console.log("connected");
  }
  catch(error) {
    console.log("error is accure when connect : ", error.message);
  }
}

export default connectDB;