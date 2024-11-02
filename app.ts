import "express-async-errors"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRouter from "./routes/users.js"
import notFoundMiddleware from "./middlewares/not-found.js"
import errorHandlerMiddleware from "./middlewares/error-handler.js"
import connectDB from "./db/connect.js"

dotenv.config()

const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/v1/users", userRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000
async function init() {
	const uri = process.env.MONGO_URI
	if (!uri) throw new Error("no uri to connect to db")
	await connectDB(uri)
	app.listen(PORT, () => {
		console.log("Server online")
	})
}

init()
