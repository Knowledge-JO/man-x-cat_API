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

const items = [
	{ option: "MANX", prob: 5, pize: 2 },
	{ option: "400", prob: 20, prize: 400 },
	{ option: "USDT", prob: 2, prize: 1 },
	{
		option: "500",
		prob: 17,
		prize: 500,
	},
	{
		option: "image",
		prob: 40,
		prize: 100,
	},
	{ option: "600", prob: 7, prize: 600 },
	{ option: "700", prob: 5, prize: 700 },
	{ option: "800", prob: 4, prize: 800 },
]

const result = weightedRandomChoice(items)
console.log(result)
