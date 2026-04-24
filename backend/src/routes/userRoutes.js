import express from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;