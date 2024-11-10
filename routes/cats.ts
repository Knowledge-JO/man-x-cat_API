import express from "express"
import { getCats, getCat, buyCat } from "../controllers/cats.js"
import { authMiddlewareWrapper, controllerWrapper } from "./wrapper.js"

const router = express.Router()

router.get("/", authMiddlewareWrapper, (req, res) =>
	controllerWrapper(req, res, getCats)
)

router.get("/:id/:catId", authMiddlewareWrapper, (req, res) =>
	controllerWrapper(req, res, getCat)
)

router.post("/purchase/:id/:catId", authMiddlewareWrapper, (req, res) =>
	controllerWrapper(req, res, buyCat)
)

export default router
