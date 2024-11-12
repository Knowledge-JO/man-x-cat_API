import connectDB from "./db/connect.js"
import dotenv from "dotenv"
import Task from "./models/Task.js"
import mongoose from "mongoose"
dotenv.config()

async function tasks() {
	await connectDB(process.env.MONGO_URI || "")

	await Task.deleteMany({})

	await Task.create({
		title: "A test task",
		type: "telegram",
		reward: 3000,
	})
	console.log("tasks created")
}

tasks().then(async () => await mongoose.disconnect())
