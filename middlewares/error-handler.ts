import {
	Errback,
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express"
import { CustomAPIError } from "../errors/index.js"
import { StatusCodes } from "http-status-codes"

function errorHandlerMiddleware(
	err: ErrorRequestHandler,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (err instanceof CustomAPIError) {
		res.status(err.statusCode).json({ message: err.message })
	}

	res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
}

export default errorHandlerMiddleware
