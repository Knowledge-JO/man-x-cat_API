import { Request, Response } from "express";

async function createUser(req: Request, res: Response) {
  res.send("Create user");
}

async function getUsers(req: Request, res: Response) {
  res.send("get users");
}

async function getUser(req: Request, res: Response) {
  res.send("get user");
}

async function updateUserScore(req: Request, res: Response) {
  res.send("update user score");
}

async function updateUserFarmData(req: Request, res: Response) {
  res.send("Update user farm data");
}

async function updateUserDailyRewards(req: Request, res: Response) {
  res.send("update daily rewards");
}

async function deleteUser(req: Request, res: Response) {
  res.send("delete user");
}

export {
  createUser,
  getUsers,
  getUser,
  updateUserScore,
  updateUserFarmData,
  updateUserDailyRewards,
  deleteUser,
};
