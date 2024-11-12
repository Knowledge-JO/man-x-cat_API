import { Request, Response } from "express"

async function loginAdminUser(req: Request, res: Response) {
	const { username, telegramId, password } = req.body

	res.send("Login and create user")
}

export { loginAdminUser }
