import mongoose from "mongoose"

async function connectDB(uri: string) {
	return await mongoose.connect(uri)
}

export default connectDB
