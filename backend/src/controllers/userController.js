import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive } = req.query;

  const filter = {};

  if (role) filter.role = role;

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });

  return successResponse(res, "Users fetched successfully", users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  return successResponse(res, "User fetched successfully", user);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400);
    throw new Error("isActive must be true or false");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = isActive;
  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  return successResponse(res, "User status updated successfully", updatedUser);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["admin", "teacher", "student"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  return successResponse(res, "User role updated successfully", updatedUser);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  await user.deleteOne();

  return successResponse(res, "User deleted successfully");
});