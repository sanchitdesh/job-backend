import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

export const userRoute = express.Router();

userRoute.post("/auth/create", singleUpload, createUser);
userRoute.post("/auth/login", loginUser);
userRoute.get("/logout", logoutUser);
userRoute.put("/profile/update", isAuthenticated, singleUpload, updateProfile);
