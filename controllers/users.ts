import { Request, Response } from "express"
import User, { DayType, ReferralType } from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import { createJWT, timeInSec, weightedRandomChoice } from "../utils/helpers.js"
import ShortUniqueId from "short-unique-id"
import { IAuthUser } from "../middlewares/authentication.js"
import {
	BadRequestError,
	InsufficientBalanceError,
	NotAllowedError,
} from "../errors/index.js"
import Bot from "../models/Bot.js"

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

		await refAccount.updateOne({
			referrals: [...refs, referredUserDets],
			goldEarned: refAccount.goldEarned + 500,
			tickets: refAccount.tickets + 1,
		})
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

	if (user.autoFarm.startTime > 0)
		throw new NotAllowedError("Auto farming is active")

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

	await user.updateOne({
		"farm.lastUpdateTime": lastUpdate == endTime ? endTime : timeInSec(),
		"farm.earned": earned + earnings,
	})
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
		await user.updateOne({
			goldEarned:
				user.goldEarned + user.dailyReward[user.dailyReward["currentDay"]],
			"dailyReward.totalRewardsEarned": totalEarned,
			"dailyReward.currentDay": nextDay,
			"dailyReward.startTime": timeInSec(),
			"dailyReward.nextStartTime": timeInSec(24),
			"dailyReward.resetTime": timeInSec(48),
		})

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

async function buyAutofarmBot(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))!

	const botPrice = (await Bot.find({}))[0].price

	if (botPrice > user.goldEarned)
		throw new InsufficientBalanceError("You do not have enough gold coins")

	if (user.autoFarm.purchased) {
		res.status(StatusCodes.OK).json({ message: "Bot is already purchased" })
		return
	}

	await user.updateOne({
		goldEarned: user.goldEarned - botPrice,
		"autoFarm.purchased": true,
	})

	res
		.status(StatusCodes.OK)
		.json({ message: "Auto farm bot purchased succesfully" })
}

async function startAutoFarming(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))!

	const startTime = user.autoFarm.startTime

	if (user.ownedCats.length == 0)
		throw new NotAllowedError("You do not own any cats")

	// if (!user.autoFarm.purchased)
	// 	throw new NotAllowedError("Please purchase the auto farm bot")

	if (startTime == 0) {
		// means farm has ended or not started
		// start farming

		user.autoFarm = {
			startTime: timeInSec(),
			lastUpdateTime: timeInSec(),
			endTime: timeInSec(24),
			purchased: true,
		}

		await user.save()

		res
			.status(StatusCodes.ACCEPTED)
			.json({ started: true, message: "Auto farming started" })
		return
	}

	res
		.status(StatusCodes.ACCEPTED)
		.json({ started: true, message: "Auto farming in progess" })
}

async function updateAutoFarmData(req: IAuthUser, res: Response) {
	// total hours - 24hrs

	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const startTime = user.autoFarm.startTime
	const lastUpdateTime = user.autoFarm.lastUpdateTime
	const endTime = user.autoFarm.endTime
	const perHr = user.farm.perHr
	const earned = user.manxEarned

	if (startTime == 0) {
		throw new BadRequestError("Auto farming not started")
	}

	const lastUpdate = timeInSec() > endTime ? endTime : lastUpdateTime

	const earnPerSec = perHr / 3600

	const lostTime =
		lastUpdate == endTime ? endTime - lastUpdateTime : timeInSec() - lastUpdate

	if (lastUpdate == endTime) {
		const autoFarm = {
			startTime: 0,
			lastUpdateTime: 0,
			endTime: 0,
		}
		await user.updateOne({ autoFarm })

		res.status(StatusCodes.OK).json({
			started: false,
			ended: true,
			earned,
			message: "Auto farming ended",
		})

		return
	}

	const earnings = lostTime * earnPerSec

	await user.updateOne({
		"autoFarm.lastUpdateTime": lastUpdate == endTime ? endTime : timeInSec(),
		manxEarned: earned + earnings,
	})

	res.status(StatusCodes.OK).json({
		earned: earned + earnings,
		started: true,
		ended: lastUpdate === endTime,
		message: "Auto farming in progess",
	})
}

const items = [
	{ option: "MANX", prob: 8, prize: 2 },
	{ option: "400", prob: 35, prize: 400 },
	{ option: "USDT", prob: 2, prize: 1 },
	{
		option: "500",
		prob: 27,
		prize: 500,
	},
	{
		option: "image",
		prob: 5,
		prize: 4,
	},
	{ option: "600", prob: 14, prize: 600 },
	{ option: "700", prob: 5, prize: 700 },
	{ option: "800", prob: 4, prize: 800 },
]

async function spinWheel(req: IAuthUser, res: Response) {
	const { id } = req.params
	const user = (await User.findOne({ telegramId: id }))! // user already verified in authentication

	const tickets = user.tickets

	if (tickets == 0) throw new NotAllowedError("You do not have enough tickets")

	const prizeIndex = weightedRandomChoice(items)
	const prize = items.find((item, index) => index == prizeIndex)

	if (prize?.option !== "USDT" && prize?.option !== "MANX") {
		await user.updateOne({ goldEarned: user.goldEarned + Number(prize?.prize) })
	}

	if (prize?.option == "MANX" || prize?.option == "image") {
		await user.updateOne({ manxEarned: user.manxEarned + Number(prize.prize) })
	}

	await user.updateOne({
		tickets: tickets - 1,
	})

	res.status(StatusCodes.OK).json({ prizeIndex, prize })
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
	startAutoFarming,
	updateAutoFarmData,
	buyAutofarmBot,
	spinWheel,
}
