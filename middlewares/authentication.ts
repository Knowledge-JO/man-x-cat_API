import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import UnAuthenticatedError from "../errors/unauthenticated.js"
import BadRequestError from "../errors/bad-request.js"

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
			req.user = { id: payload.userId }
			console.log(jwtPayload)
			next()
		} else {
			throw new UnAuthenticatedError("Unauthorized access")
		}
	} catch (err) {
		throw new UnAuthenticatedError(`unauthorized access: ${err}`)
	}
}

export default authMiddleware
