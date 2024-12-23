import { BadRequestError } from "../errors/index.js"
import jwt from "jsonwebtoken"
import bycrypt from "bcryptjs"

function createJWT(id: string, name: string) {
	const secret = process.env.JWT_SECRET
	if (!secret) throw new BadRequestError("no secret token")

	return jwt.sign({ userId: id, name }, secret, {
		expiresIn: process.env.JWT_LIFETIME,
	})
}

function timeInSec(addHrs = 0) {
	const inSecs = addHrs * 3600
	const secs = Date.now() / 1000

	return secs + inSecs
}

async function validatePassword(userPassword: string, currPassword: string) {
	const isValid = await bycrypt.compare(userPassword, currPassword)
	return isValid
}

function weightedRandomChoice(
	itemsWithProbs: { option: string; prob: number }[]
) {
	/**
	 * Selects a random item based on its probability.
	 * @param {Array} itemsWithProbs - Array of objects with `item` and `prob` properties.
	 *                                 Example: [{ item: "orange", prob: 0.5 }, { item: "apple", prob: 1.0 }]
	 * @return {string} - The selected item.
	 */

	// Calculate the total probability
	const totalProb = itemsWithProbs.reduce((sum, { prob }) => sum + prob, 0)

	// Normalize the probabilities and create a cumulative distribution
	const cumulativeProbs = []
	let cumulativeSum = 0

	for (const { option, prob } of itemsWithProbs) {
		cumulativeSum += prob / totalProb
		cumulativeProbs.push({ option, cumulativeSum })
	}

	// Generate a random number between 0 and 1
	const randomValue = Math.random()

	// Find the item corresponding to the random value
	for (const { option, cumulativeSum } of cumulativeProbs) {
		if (randomValue <= cumulativeSum) {
			return itemsWithProbs.findIndex((item) => item.option === option)
		}
	}
}

export { createJWT, timeInSec, validatePassword, weightedRandomChoice }
