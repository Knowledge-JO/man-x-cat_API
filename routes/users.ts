import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUserDailyRewards,
  updateUserFarmData,
  updateUserScore,
} from "../controllers/users.js";

const router = express.Router();

router.route("/").post(createUser).get(getUsers);
router.get("/:id", getUser);
router.post("/score/:id", updateUserScore);
router.post("/daily/:id", updateUserDailyRewards);
router.post("/farm/:id", updateUserFarmData);

export default router;
