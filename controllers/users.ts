import { Request, Response } from "express"
import User from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import { createJWT, timeInSec } from "../utils/helpers.js"
import ShortUniqueId from "short-unique-id"
import { IAuthUser } from "../middlewares/authentication.js"
import NotFoundError from "../errors/not-found.js"

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
		referredBy: "",
		referralCode,
	})
	const token = createJWT(user._id.toString(), name)

	// check if referral account exist and update
	const refAccount = await User.findOne({ referralCode: referredBy })
	if (refAccount) {
		user.coinsEarned += 500
		user.referredBy = referredBy
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

	res.status(StatusCodes.OK).json({ data: user })
}

async function updateUserFarmData(req: IAuthUser, res: Response) {
	// total hours - 3hrs
	// profit per hour - 42

	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))!

	const startTime = user.farm.startTime
	const lastUpdateTime = user.farm.lastUpdateTime
	const endTime = user.farm.endTime
	const earned = user.farm.earned
	const perHr = user.farm.perHr
	const totalHrs = user.farm.totalHrs

	if (startTime == 0) {
		// means farm has ended or not started
		// start farming

		user.farm = {
			startTime: timeInSec(),
			lastUpdateTime: timeInSec(),
			endTime: timeInSec(totalHrs),
			earned: 0,
			perHr,
			totalHrs,
		}
		//user.farm.startTime = timeInSec()
		await user.save()

		res.status(StatusCodes.ACCEPTED).send("Farming started")
		return
	}

	const lastUpdate = timeInSec() > endTime ? endTime : lastUpdateTime

	if (lastUpdate == endTime) {
		// claim rewards
		// reset to zero
		user.coinsEarned += earned
		user.farm = {
			startTime: 0,
			lastUpdateTime: 0,
			endTime: 0,
			earned: 0,
			perHr,
			totalHrs,
		}

		await user.save()

		res.status(StatusCodes.RESET_CONTENT).send("Farm data reset")
		return
	}

	const earnPerSec = perHr / 3600
	const lostTime = timeInSec() - lastUpdate
	const earnings = lostTime * earnPerSec

	//user.farm["lastUpdateTime"] = timeInSec()
	await User.updateOne(
		{ telegramId: id },
		{
			"farm.lastUpdateTime": timeInSec(),
			"farm.earned": earned + earnings,
		}
	)
	// await user.save()
	res
		.status(StatusCodes.OK)
		.json({ lostTime, earned, maxEarning: perHr * totalHrs })
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
	updateUserFarmData,
	updateUserDailyRewards,
	deleteUser,
}
