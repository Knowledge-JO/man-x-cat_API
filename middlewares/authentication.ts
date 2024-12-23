import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import User from "../models/User.js"
import {
	NotFoundError,
	BadRequestError,
	UnAuthenticatedError,
} from "../errors/index.js"

export interface IAuthUser extends Request {
	user: {
		id: string
	}
}

interface IPayload extends JwtPayload {
	userId: string
}

async function authMiddleware(
	req: IAuthUser,
	res: Response,
	next: NextFunction
) {
	const authToken = req.headers.authorization
	const id = req.params.id

	if (!authToken || !authToken.startsWith("Bearer")) {
		throw new UnAuthenticatedError("Unauthorized")
	}

	const token = authToken.split(" ")[1]
	const secret = process.env.JWT_SECRET
	if (!secret) {
		throw new BadRequestError("error authorizing")
	}
	try {
		const jwtPayload = jwt.verify(token, secret)

		if (typeof jwtPayload !== "string") {
			const payload = jwtPayload as IPayload
			if (id) {
				const userAcct = await User.findOne({ telegramId: id })

				if (!userAcct) throw new NotFoundError("User not found")

				if (userAcct._id.toString() !== payload.userId)
					throw new UnAuthenticatedError("Unauthorized access")
			}
			req.user = { id: payload.userId }
			next()
		} else {
			throw new UnAuthenticatedError("Unauthorized access")
		}
	} catch (err) {
		throw new UnAuthenticatedError(`${err}`)
	}
}

export default authMiddleware
