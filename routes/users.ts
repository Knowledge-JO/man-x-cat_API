import express, { Request, Response } from "express"
import {
	claimFarmRewards,
	createUser,
	getUser,
	getUsers,
	startFarming,
	updateUserDailyRewards,
	updateUserFarmData,
	resetDailyRewards,
	startAutoFarming,
	updateAutoFarmData,
	buyAutofarmBot,
	spinWheel,
} from "../controllers/users.js"
import { authMiddlewareWrapper, controllerWrapper } from "./wrapper.js"

const router = express.Router()

router.route("/").post(createUser).get(authMiddlewareWrapper, getUsers)

router.get("/:id", authMiddlewareWrapper, (req: Request, res: Response) =>
	controllerWrapper(req, res, getUser)
)

router.post(
	"/daily/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, updateUserDailyRewards)
)

router.post(
	"/daily/reset/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) =>
		controllerWrapper(req, res, resetDailyRewards)
)

router.post("/farm/:id", authMiddlewareWrapper, (req: Request, res: Response) =>
	controllerWrapper(req, res, updateUserFarmData)
)

router.post(
	"/farm/claim/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) => controllerWrapper(req, res, claimFarmRewards)
)

router.post(
	"/farm/start/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) => controllerWrapper(req, res, startFarming)
)
router.post(
	"/auto/buy/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) => controllerWrapper(req, res, buyAutofarmBot)
)
router.post(
	"/auto/start/:id",
	authMiddlewareWrapper,
	(req: Request, res: Response) => controllerWrapper(req, res, startAutoFarming)
)
router.post("/auto/:id", authMiddlewareWrapper, (req: Request, res: Response) =>
	controllerWrapper(req, res, updateAutoFarmData)
)
router.post("/spin/:id", authMiddlewareWrapper, (req: Request, res: Response) =>
	controllerWrapper(req, res, spinWheel)
)
export default router
