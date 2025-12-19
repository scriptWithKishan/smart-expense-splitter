import express from "express";
import { createGroup, getUserGroups, getGroupById, joinGroup, deleteGroup, getGroupBalances, getGroupActivity } from "../controllers/group-controller.js";
import auth from "../middleware/auth.js";

const GroupRouter = express.Router();

// Group Routes
GroupRouter.post("/", auth, createGroup);
GroupRouter.get("/", auth, getUserGroups);
GroupRouter.post("/join", auth, joinGroup);
GroupRouter.get("/:id", auth, getGroupById);
GroupRouter.delete("/:id", auth, deleteGroup);
GroupRouter.get("/:id/balances", auth, getGroupBalances);
GroupRouter.get("/:id/activity", auth, getGroupActivity);

export default GroupRouter;
