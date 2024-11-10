import { StatusCodes } from "http-status-codes"
import CustomAPIError from "./custom-errors.js"

class InsufficientBalanceError extends CustomAPIError {
	constructor(message: string) {
		super(message, StatusCodes.EXPECTATION_FAILED)
	}
}

export default InsufficientBalanceError
