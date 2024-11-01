import { Request, Response } from "express"
import User from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import { createJWT } from "../utils/helpers.js"
import ShortUniqueId from "short-unique-id"
import NotFoundError from "../errors/not-found.js"
import { IAuthUser } from "../middlewares/authentication.js"
import UnAuthenticatedError from "../errors/unauthenticated.js"

async function createUser(req: Request, res: Response) {
	const { telegramId, name, referredBy } = req.body

	const userAccount = await User.findOne({ telegramId })

	if (userAccount) {
		const token = createJWT(
			userAccount._id.toString(),
			userAccount.name
		)
		res.status(StatusCodes.ACCEPTED).json({ token })
	}

	const uid = new ShortUniqueId({ length: 10 })
	const referralCode = uid.rnd()

	const user = new User({
		...req.body,
		referredBy: referredBy || "",
		referralCode,
	})
	const token = createJWT(user._id.toString(), name)

	// check if referral account exist and update
	const refAccount = await User.findOne({ referralCode: referredBy })
	if (refAccount) {
		user.coinsEarned += 500

		const refs = refAccount.referrals
		refAccount.referrals = [...refs, referralCode]
		refAccount.coinsEarned += 500

		await refAccount.save()
	}

	await user.save()

	res.status(StatusCodes.CREATED).json({ data: user, token })
}

async function getUsers(req: Request, res: Response) {
	const users = await User.find({})
		.select("name coinsEarned")
		.sort("-coinsEarned")

	res
		.status(StatusCodes.OK)
		.json({ data: users, NbHits: users.length })
}

async function getUser(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = await User.findOne({ telegramId: id })
	if (!user) {
		throw new NotFoundError("User does not exists")
	}

	if (req.user.id !== user._id.toString()) {
		throw new UnAuthenticatedError("cannot view this data")
	}

	res.status(StatusCodes.OK).json({ data: user })
}

async function updateUserScore(req: IAuthUser, res: Response) {
	res.send("update user score")
}

async function updateUserFarmData(req: IAuthUser, res: Response) {
	res.send("Update user farm data")
}

async function updateUserDailyRewards(req: IAuthUser, res: Response) {
	res.send("update daily rewards")
}

async function deleteUser(req: IAuthUser, res: Response) {
	res.send("delete user")
}

export {
	createUser,
	getUsers,
	getUser,
	updateUserScore,
	updateUserFarmData,
	updateUserDailyRewards,
	deleteUser,
}
