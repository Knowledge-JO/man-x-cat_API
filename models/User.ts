import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import BadRequestError from "../errors/bad-request.js"

type DailyRewardType = {
	day1: number
	day2: number
	day3: number
	day4: number
	day5: number
	day6: number
	day7: number
}

type DayType = keyof DailyRewardType

type DailyDataType = DailyRewardType & {
	currentDay: DayType
	totalRewardsEarned: number
	startTime: number
	endTime: number
	nextStartTime: number
}

const dailyRewardDefaultData: DailyDataType = {
	day1: 100,
	day2: 120,
	day3: 140,
	day4: 160,
	day5: 180,
	day6: 200,
	day7: 220,
	currentDay: "day1",
	totalRewardsEarned: 0,
	startTime: 0,
	endTime: 0,
	nextStartTime: 0,
}

type FarmType = {
	startTime: number
	lastUpdateTime: number
	endTime: number
	earned: number
	perHr: number
	totalHrs: number
}

const farmDefaultData: FarmType = {
	startTime: 0,
	lastUpdateTime: 0,
	endTime: 0,
	earned: 0,
	perHr: 42,
	totalHrs: 3,
}

interface IUser {
	name: string
	telegramId: number
	coinsEarned: number
	farm: FarmType
	dailyReward: DailyDataType
	referrals: Array<string>
	referralCode: string
	referredBy: string
}

const userSchema: Schema = new Schema(
	{
		name: {
			type: String,
			min: 1,
			max: 60,
			required: [true, "A name must be provided"],
		},
		telegramId: {
			type: Number,
			required: [true, "telegram userId must be provided"],
		},
		coinsEarned: { type: Number, required: false, default: 100 },
		farm: {
			type: Object,
			required: false,
			default: farmDefaultData,
		},

		dailyReward: {
			type: Object,
			required: false,
			default: dailyRewardDefaultData,
		},

		referrals: {
			type: Array<string>,
			required: false,
			default: [],
		},

		referralCode: {
			type: String,
			required: true,
		},

		referredBy: {
			type: String,
			required: false,
			default: "",
		},
	},
	{ timestamps: true }
)

const User = mongoose.model<IUser>("User", userSchema)

export default User
