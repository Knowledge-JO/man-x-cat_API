import { Request, Response } from "express"
import User, { DayType, ReferralType } from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import { createJWT, timeInSec } from "../utils/helpers.js"
import ShortUniqueId from "short-unique-id"
import { IAuthUser } from "../middlewares/authentication.js"
import { BadRequestError, NotAllowedError } from "../errors/index.js"

async function createUser(req: Request, res: Response) {
	const { telegramId, name, referredBy } = req.body

	const userAccount = await User.findOne({ telegramId })

	if (userAccount) {
		const token = createJWT(userAccount._id.toString(), userAccount.name)
		res.status(StatusCodes.ACCEPTED).json({ token })
		return
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
		user.goldEarned += 500
		user.referredBy = referredBy
		const refs = refAccount.referrals

		const referredUserDets: ReferralType = {
			name: req.body.name,
			earned: 500,
			referralCode,
		}

		refAccount.referrals = [...refs, referredUserDets]
		refAccount.goldEarned += 500

		await refAccount.save()
	}

	await user.save()

	res.status(StatusCodes.CREATED).json({ data: user, token })
}

async function getUsers(req: Request, res: Response) {
	const users = await User.find({})
		.select("name manxEarned goldEarned")
		.sort("-manxEarned -goldEarned")

	res.status(StatusCodes.OK).json({ data: users, NbHits: users.length })
}

async function getUser(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	res.status(StatusCodes.OK).json({ data: user })
}

async function startFarming(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))!

	const startTime = user.farm.startTime
	const perHr = user.farm.perHr
	const totalHrs = user.farm.totalHrs

	if (user.ownedCats.length == 0)
		throw new NotAllowedError("You do not own any cats")

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

		res
			.status(StatusCodes.ACCEPTED)
			.json({ started: true, message: "Farming started" })
		return
	}

	res
		.status(StatusCodes.ACCEPTED)
		.json({ started: true, message: "Farming in progess" })
}

async function updateUserFarmData(req: IAuthUser, res: Response) {
	// total hours - 3hrs
	// profit per hour - 42

	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const startTime = user.farm.startTime
	const lastUpdateTime = user.farm.lastUpdateTime
	const endTime = user.farm.endTime
	const earned = user.farm.earned
	const perHr = user.farm.perHr
	const totalHrs = user.farm.totalHrs

	if (startTime == 0) {
		throw new BadRequestError("Farming not started")
	}

	const lastUpdate = timeInSec() > endTime ? endTime : lastUpdateTime

	const earnPerSec = perHr / 3600

	const lostTime =
		lastUpdate == endTime ? endTime - lastUpdateTime : timeInSec() - lastUpdate

	const earnings = lostTime * earnPerSec

	await User.updateOne(
		{ telegramId: id },
		{
			"farm.lastUpdateTime": lastUpdate == endTime ? endTime : timeInSec(),
			"farm.earned": earned + earnings,
		}
	)
	res.status(StatusCodes.OK).json({
		earned,
		maxEarning: perHr * totalHrs,
		totalHrs,
		started: true,
		ended: lastUpdate === endTime,
	})
}

async function claimFarmRewards(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const startTime = user.farm.startTime
	const lastUpdateTime = user.farm.lastUpdateTime
	const endTime = user.farm.endTime
	const earned = user.farm.earned
	const perHr = user.farm.perHr
	const totalHrs = user.farm.totalHrs

	const lastUpdate = timeInSec() > endTime ? endTime : lastUpdateTime
	if (lastUpdate == endTime) {
		// claim rewards
		// reset to zero
		user.manxEarned += earned
		user.farm = {
			startTime: 0,
			lastUpdateTime: 0,
			endTime: 0,
			earned: 0,
			perHr,
			totalHrs,
		}

		await user.save()

		res.status(StatusCodes.RESET_CONTENT).json({
			started: false,
			message: "Rewards claimed - content reset",
		})
		return
	}

	if (startTime == 0) {
		throw new BadRequestError("Farming not started")
	}

	res
		.status(StatusCodes.OK)
		.json({ started: true, message: "Farming in progress" })
}

async function updateUserDailyRewards(req: IAuthUser, res: Response) {
	// update daily reward
	// day 1 - day7
	// 1 day missed, back to day 1
	// day7 claimed - back to day 1
	const { id } = req.params

	// reset
	await reset(+id)

	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const days: DayType[] = [
		"day1",
		"day2",
		"day3",
		"day4",
		"day5",
		"day6",
		"day7",
	]

	const currentDay = user.dailyReward.currentDay
	const index = days.indexOf(currentDay)
	const nextStartTime = user.dailyReward.nextStartTime

	if (timeInSec() >= nextStartTime) {
		const nextDay = days[index < days.length - 1 ? index + 1 : 0]
		const totalEarned =
			user.dailyReward.totalRewardsEarned +
			user.dailyReward[user.dailyReward["currentDay"]]
		await User.updateOne(
			{ telegramId: id },
			{
				goldEarned:
					user.goldEarned + user.dailyReward[user.dailyReward["currentDay"]],
				"dailyReward.totalRewardsEarned": totalEarned,
				"dailyReward.currentDay": nextDay,
				"dailyReward.startTime": timeInSec(),
				"dailyReward.nextStartTime": timeInSec(24),
				"dailyReward.resetTime": timeInSec(48),
			}
		)

		res.status(StatusCodes.OK).json({
			currentDay: nextDay,
			totalRewardsEarned: totalEarned,
			message: "daily reward claimed",
		})
		return
	}
	res.status(StatusCodes.OK).json({
		currentDay,
		totalRewardsEarned: user.dailyReward.totalRewardsEarned,
	})
}

async function resetDailyRewards(req: IAuthUser, res: Response) {
	// if date.now greater than reset time, set daily rewards back to 1
	const { id } = req.params

	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const resetted = await reset(+id)
	const totalRewardsEarned = user.dailyReward.totalRewardsEarned
	if (resetted) {
		res.status(StatusCodes.RESET_CONTENT).json({
			currentDay: user.dailyReward.currentDay,
			totalRewardsEarned,
			message: "rewards reset",
		})
		return
	}

	res.status(StatusCodes.OK).json({
		currentDay: user.dailyReward.currentDay,
		totalRewardsEarned,
		message: "reset time not reached",
	})
}

async function reset(id: number): Promise<boolean> {
	// reset
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication
	const resetTime = user.dailyReward.resetTime
	if (timeInSec() > resetTime) {
		await User.updateOne(
			{ telegramId: id },
			{
				"dailyReward.currentDay": "day1",
				"dailyReward.startTime": timeInSec(),
				"dailyReward.nextStartTime": timeInSec(24), // next 24hrs
				"dailyReward.resetTime": timeInSec(48), // next 48hrs
			}
		)
		return true
	}
	return false
}

export {
	createUser,
	getUsers,
	getUser,
	updateUserFarmData,
	updateUserDailyRewards,
	claimFarmRewards,
	startFarming,
	resetDailyRewards,
}
