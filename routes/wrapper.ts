import { Request, Response, NextFunction } from "express"

import authMiddleware, { IAuthUser } from "../middlewares/authentication.js"

function authMiddlewareWrapper(
	req: Request,
	res: Response,
	next: NextFunction
) {
	return authMiddleware(req as IAuthUser, res, next)
}

function controllerWrapper(
	req: Request,
	res: Response,
	func: (req: IAuthUser, res: Response) => Promise<void>
) {
	return func(req as IAuthUser, res)
}

export { authMiddlewareWrapper, controllerWrapper }
