import { Request, Response } from "express"
import { IAuthUser } from "../middlewares/authentication.js"
import Task from "../models/Task.js"
import { StatusCodes } from "http-status-codes"
import { NotAllowedError, NotFoundError } from "../errors/index.js"
import User from "../models/User.js"

async function createTask(req: Request, res: Response) {
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

	const completedTasks = user.completedTasks

	if (completedTasks.includes(taskId))
		throw new NotAllowedError("Task already completed")

	const newCompletedTasks = [...user.completedTasks, taskId]

	const ticketReward =
		user.taskTicketReward + 1 > 3 ? 1 : user.taskTicketReward + 1

	await user.updateOne({
		completedTasks: newCompletedTasks,
		goldEarned: user.goldEarned + task.reward,
		taskTicketReward: ticketReward,
	})

	const taskCount = user.taskTicketReward
	if (taskCount == 3) {
		await user.updateOne({
			tickets: user.tickets + 1,
		})
	}

	res.status(StatusCodes.OK).json({ message: "task completed", taskId })
}

export { getTasks, getTask, completeTask, createTask, updateTask }
