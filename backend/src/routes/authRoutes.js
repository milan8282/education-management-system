import express from "express";
import { signup, login, getProfile } from "../controllers/authController.js";
import {
  signupValidation,
  loginValidation,
} from "../validations/authValidation.js";
import validateRequest from "../middlewares/validateMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupValidation, validateRequest, signup);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", protect, getProfile);

export default router;