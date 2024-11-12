import express from "express"
import { loginAdminUser } from "../controllers/auth.js"

const router = express.Router()

router.post("/login", loginAdminUser)

export default router
