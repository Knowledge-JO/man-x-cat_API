import { Request, Response } from "express"
import { IAuthUser } from "../middlewares/authentication.js"
import Task from "../models/Task.js"
import { StatusCodes } from "http-status-codes"
import { NotFoundError } from "../errors/index.js"
import User from "../models/User.js"

async function createTask(req: Request, res: Response) {
	const { title, type, imagePath, reward } = req.body

	res.send("createTask")
}

async function getTasks(req: IAuthUser, res: Response) {
	const tasks = await Task.find({})
	res.status(StatusCodes.OK).json({ data: tasks, nbHits: tasks.length })
}

async function getTask(req: IAuthUser, res: Response) {
	const { taskId } = req.params

	const task = await Task.findOne({ _id: taskId })

	if (!task) throw new NotFoundError(`task #${taskId} not found`)

	res.status(StatusCodes.OK).json({ data: task })
}

async function updateTask(req: Request, res: Response) {
	res.send("Update task")
}

async function completeTask(req: IAuthUser, res: Response) {
	const { taskId } = req.params

	const task = await Task.findOne({ _id: taskId })

	if (!task) throw new NotFoundError(`task #${taskId} not found`)

	const userId = req.user.id

	const user = (await User.findOne({ _id: userId }))!

	const completedTasks = [...user.completedTasks, taskId]

	await user.updateOne({
		completedTasks,
		goldEarned: user.goldEarned + task.reward,
	})

	res.status(StatusCodes.OK).json({ message: "task completed", taskId })
}

export { getTasks, getTask, completeTask, createTask, updateTask }
