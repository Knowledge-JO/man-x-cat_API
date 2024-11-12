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

export { createJWT, timeInSec, validatePassword }
