import { model, Schema } from "mongoose"

type TaskType = "telegram" | "twitter" | "web" | "others"

interface ITask {
	title: string
	type: TaskType
	reward: number
	imagePath: string
}

const taskSchema = new Schema(
	{
		title: { type: String, required: [true, "specify the title of the task"] },
		type: {
			type: String,
			enum: ["telegram", "twitter", "web", "others"],
			required: [true, "specify a valid task type"],
		},
		reward: { type: Number, required: [true, "Specify the task reward"] },
		imagePath: { type: String, required: false },
	},
	{ timestamps: true }
)

const Task = model<ITask>("Task", taskSchema)

export default Task
