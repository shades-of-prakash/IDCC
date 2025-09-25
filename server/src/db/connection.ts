import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test";

export async function connectDB() {
	try {
		if (mongoose.connection.readyState === 0) {
			await mongoose.connect(uri, {
				dbName: "IDCC",
			});
			console.log("✅ Connected to MongoDB via Mongoose");
		}
	} catch (err) {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	}
}
