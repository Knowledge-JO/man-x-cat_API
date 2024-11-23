import mongoose from "mongoose"
import connectDB from "./db/connect.js"
import Bot from "./models/Bot.js"
import dotenv from "dotenv"
dotenv.config()

async function setBotPice(price: number) {
	await connectDB(process.env.MONGO_URI || "")
	await Bot.deleteMany({}) // delete all
	await Bot.create({ price })

	await mongoose.disconnect()
	console.log("bot created successfully")
}

setBotPice(100)
