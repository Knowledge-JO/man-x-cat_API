import mongoose, { Schema } from "mongoose"

type CatType = {
	name: string
	imageUrl: string
	level: number
	price: number
	outputQuantity: number
	time: number
	quaterlyAirdopValue: number
	potion: string
	feeDividend: number
	maxPurchase: number
}

const catSchema: Schema = new Schema({
	name: { type: String, required: [true, "Name of the cat is required"] },

	level: { type: Number, required: [true, "level is required"] },

	price: { type: Number, required: [true, "set a price for the cat"] },

	outputQuantity: { type: Number, required: [true, "set rate per hr"] },

	time: { type: Number, default: 3 },

	imageUrl: {
		type: String,
		required: [true, "The url to the image of the cat is required"],
	},

	quaterlyAirdopValue: {
		type: Number,
		required: [true, "value for quarterly airdrop must be provided"],
	},

	potion: {
		type: String,
		required: [true, "potion acquired after purchase must be provided"],
	},

	feeDividend: { type: Number, required: false, default: 0 },

	maxPurchase: {
		type: Number,
		required: [true, "Specify max amount a cat can be purchased"],
	},
})

const Cat = mongoose.model<CatType>("Cat", catSchema)

export default Cat
