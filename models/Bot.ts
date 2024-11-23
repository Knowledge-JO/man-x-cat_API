import { model, Schema } from "mongoose"

interface IBot {
	price: number
}

const botSchema = new Schema({
	price: { type: Number, required: true, default: 100 },
})

const Bot = model<IBot>("Bot", botSchema)

export default Bot
