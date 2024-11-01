import { BadRequestError } from "../errors/index.js"
import jwt from "jsonwebtoken"

function createJWT(id: string, name: string) {
	const secret = process.env.JWT_SECRET
	if (!secret) throw new BadRequestError("no secret token")

	return jwt.sign({ userId: id, name }, secret, {
		expiresIn: process.env.JWT_LIFETIME,
	})
}

export { createJWT }
