import { Request, Response } from "express"

async function loginAdminUser(req: Request, res: Response) {
	res.send("Login and create user")
}

export { loginAdminUser }
