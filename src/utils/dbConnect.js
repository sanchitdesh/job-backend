import mongoose from "mongoose";
export const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "JobPortal",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected successfully ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error in connecting database : ${error.message}`);
    process.exit(1);
  }
};
