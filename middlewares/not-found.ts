import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

async function notFoundMiddleware(
	req: Request,
	res: Response
) {
	res
		.status(StatusCodes.NOT_FOUND)
		.json({ message: "Route does not exists" })
}

export default notFoundMiddleware
