import express, { NextFunction, Request, Response } from "express"
import {
	claimFarmRewards,
	createUser,
	getUser,
	getUsers,
	startFarming,
	updateUserDailyRewards,
	updateUserFarmData,
} from "../controllers/users.js"

import authMiddleware, {
	IAuthUser,
} from "../middlewares/authentication.js"

const router = express.Router()

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

router
	.route("/")
	.post(createUser)
	.get(authMiddlewareWrapper, getUsers)

router.get(
	"/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, getUser)
)

router.post(
	"/daily/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, updateUserDailyRewards)
)

router.post(
	"/farm/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, updateUserFarmData)
)

router.post(
	"/farm/claim/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, claimFarmRewards)
)

router.post(
	"/farm/start/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, startFarming)
)

export default router
