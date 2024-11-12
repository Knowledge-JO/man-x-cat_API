import express from "express"
import { completeTask, getTask, getTasks } from "../controllers/task.js"
import { authMiddlewareWrapper, controllerWrapper } from "./wrapper.js"

const router = express.Router()

router
	.route("/")
	.get(authMiddlewareWrapper, (req, res) =>
		controllerWrapper(req, res, getTasks)
	)

router.get("/:id/:taskId", authMiddlewareWrapper, (req, res) =>
	controllerWrapper(req, res, getTask)
)

router.post("/complete/:id/:taskId", authMiddlewareWrapper, (req, res) =>
	controllerWrapper(req, res, completeTask)
)

export default router
