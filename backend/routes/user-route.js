import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/user-controller.js";
import auth from "../middleware/auth.js";

const UserRouter = express.Router();

// User Routes
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.get("/me", auth, getMe);

export default UserRouter;
