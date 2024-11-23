import mongoose, { Schema } from "mongoose"
import { timeInSec } from "../utils/helpers.js"

export type DailyRewardType = {
	day1: number
	day2: number
	day3: number
	day4: number
	day5: number
	day6: number
	day7: number
}

export type DayType = keyof DailyRewardType

type DailyDataType = DailyRewardType & {
	currentDay: DayType
	totalRewardsEarned: number
	startTime: number
	nextStartTime: number
	resetTime: number
}

export type OwnedCatType = {
	catId: string
	outputQuantityTime: number
	numberOwned: number
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
	startTime: timeInSec(),
	nextStartTime: timeInSec(),
	resetTime: timeInSec(24),
}

type FarmType = {
	startTime: number
	lastUpdateTime: number
	endTime: number
	earned: number
	perHr: number
	totalHrs: number
}

type AutoFarmType = {
	startTime: number
	lastUpdateTime: number
	endTime: number
	purchased: boolean
}

const farmDefaultData: FarmType = {
	startTime: 0,
	lastUpdateTime: 0,
	endTime: 0,
	earned: 0,
	perHr: 0,
	totalHrs: 3,
}

const autoFarm: AutoFarmType = {
	startTime: 0,
	lastUpdateTime: 0,
	endTime: 0,
	purchased: false,
}

export type ReferralType = {
	name: string
	earned: number
	referralCode: string
}

export interface IUser {
	name: string
	telegramId: number
	manxEarned: number
	goldEarned: number
	farm: FarmType
	dailyReward: DailyDataType
	referrals: ReferralType[]
	referralCode: string
	referredBy: string
	ownedCats: OwnedCatType[]
	completedTasks: Array<string>
	tickets: number
	taskTicketReward: number
	autoFarm: AutoFarmType
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
		manxEarned: { type: Number, required: false, default: 0 },
		goldEarned: { type: Number, required: false, default: 100 },
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
			type: Array,
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

		ownedCats: {
			type: Array,
			required: false,
			default: [],
		},
		completedTasks: {
			type: Array,
			required: false,
			default: [],
		},

		tickets: {
			type: Number,
			required: false,
			default: 0,
		},
		taskTicketReward: {
			type: Number,
			required: false,
			default: 0,
		},

		autoFarm: {
			type: Object,
			required: false,
			default: autoFarm,
		},
	},
	{ timestamps: true }
)

const User = mongoose.model<IUser>("User", userSchema)

export default User
