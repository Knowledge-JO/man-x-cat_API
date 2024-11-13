import connectDB from "./db/connect.js"
import dotenv from "dotenv"
import Task, { ITask } from "./models/Task.js"
import mongoose from "mongoose"
dotenv.config()

const tasks: ITask[] = [
	{
		title: "Follow manxcat on X (Formerly twitter)",
		type: "twitter",
		url: "https://x.com/Cats_Manx",
		reward: 500,
	},

	{
		title: "Join the manxcat telegram channel",
		type: "telegram",
		url: "https://t.me/Manxcat_game",
		reward: 500,
	},
]

async function uploadTasks() {
	await connectDB(process.env.MONGO_URI || "")

	await Task.deleteMany({})

	for (const task of tasks) {
		await Task.create(task)
		console.log(task, "tasks created")
	}
}

uploadTasks().then(async () => await mongoose.disconnect())
