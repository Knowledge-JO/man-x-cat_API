import { StatusCodes } from "http-status-codes"
import CustomAPIError from "./custom-errors.js"

class NotFoundError extends CustomAPIError {
	constructor(message: string) {
		super(message, StatusCodes.NOT_FOUND)
	}
}

export default NotFoundError
