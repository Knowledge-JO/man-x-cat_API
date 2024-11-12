import { StatusCodes } from "http-status-codes"
import CustomAPIError from "./custom-errors.js"

class NotAllowedError extends CustomAPIError {
	constructor(message: string) {
		super(message, StatusCodes.NOT_ACCEPTABLE)
	}
}

export default NotAllowedError
