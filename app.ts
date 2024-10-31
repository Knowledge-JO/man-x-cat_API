import "express-async-errors"
import express from "express"
import userRouter from "./routes/users.js"
import dotenv from "dotenv"
import notFoundMiddleware from "./middlewares/not-found.js"
import errorHandlerMiddleware from "./middlewares/error-handler.js"

dotenv.config()

const app = express()

app.use(express.json())

app.use("/api/v1/users", userRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000
function init() {
	app.listen(PORT, () => {
		console.log("Server online")
	})
}

init()
