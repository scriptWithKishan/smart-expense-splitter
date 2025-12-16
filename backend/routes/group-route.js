import express from "express";
import { createGroup, getUserGroups, getGroupById, joinGroup, deleteGroup } from "../controllers/group-controller.js";
import auth from "../middleware/auth.js";

const GroupRouter = express.Router();

// Group Routes
GroupRouter.post("/", auth, createGroup);
GroupRouter.get("/", auth, getUserGroups);
GroupRouter.post("/join", auth, joinGroup);
GroupRouter.get("/:id", auth, getGroupById);
GroupRouter.delete("/:id", auth, deleteGroup);

export default GroupRouter;
