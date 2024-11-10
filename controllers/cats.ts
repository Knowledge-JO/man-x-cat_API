import { Response } from "express"
import { IAuthUser } from "../middlewares/authentication.js"
import Cat from "../models/Cats.js"
import { StatusCodes } from "http-status-codes"
import User, { OwnedCatType } from "../models/User.js"
import {
	NotFoundError,
	BadRequestError,
	InsufficientBalanceError,
} from "../errors/index.js"

async function getCats(req: IAuthUser, res: Response) {
	const cats = await Cat.find({})
	res.status(StatusCodes.OK).json({ data: cats, nbHits: cats.length })
}

async function getCat(req: IAuthUser, res: Response) {
	const { catId } = req.params
	const cat = await Cat.findOne({ _id: catId })

	if (!cat) throw new NotFoundError(`cat #${catId} not found`)

	res.status(StatusCodes.OK).json({ data: cat })
}

async function buyCat(req: IAuthUser, res: Response) {
	const { catId } = req.params
	const cat = await Cat.findOne({ _id: catId })

	const userId = req.user.id

	if (!cat) throw new NotFoundError(`cat #${catId} not found`)

	// check number of purchases per user, must not exceed max purchase per cat
	// increase perHr in user farm object on purchase

	const user = (await User.findOne({ _id: userId }))! // user already verified in authentication

	if (user.coinsEarned < cat.price)
		throw new InsufficientBalanceError(
			"you do not have enough coins to make the purchase"
		)

	const ownedCats = user.ownedCats

	const ownedCat = ownedCats.find((ownedCat) => ownedCat.catId == catId)

	if (ownedCat) {
		// check number of cat owned
		const numberOwned = ownedCat.numberOwned

		if (numberOwned == cat.maxPurchase)
			throw new BadRequestError("max purchase reached")

		// upgrade
		const ownedCatIndex = ownedCats.findIndex(
			(ownedCat) => ownedCat.catId == catId
		)

		const newOwnedCats = ownedCats.map((ownedCat, index) => {
			if (index == ownedCatIndex) {
				return {
					...ownedCat,
					outputQuantityTime: ownedCat.outputQuantityTime + cat.outputQuantity,
					numberOwned: numberOwned + 1,
				}
			}

			return ownedCat
		})

		await user.updateOne({
			ownedCats: newOwnedCats,
			"farm.perHr": user.farm.perHr + cat.outputQuantity,
			coinsEarned: user.coinsEarned - cat.price,
		})
	} else {
		const newOwnedCat: OwnedCatType = {
			catId,
			outputQuantityTime: cat.outputQuantity,
			numberOwned: 1,
		}

		const newOwnedCats = [...ownedCats, newOwnedCat]

		await user.updateOne({
			ownedCats: newOwnedCats,
			"farm.perHr": user.farm.perHr + cat.outputQuantity,
			coinsEarned: user.coinsEarned - cat.price,
		})
	}

	res
		.status(StatusCodes.ACCEPTED)
		.json({ message: "You've succesfully purchased a cat" })
}

export { getCats, getCat, buyCat }
