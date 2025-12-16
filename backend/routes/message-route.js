import express from "express";
import { sendMessage, getMessages } from "../controllers/message-controller.js";
import auth from "../middleware/auth.js";

const MessageRouter = express.Router();

// Message Routes
MessageRouter.post("/", auth, sendMessage);
MessageRouter.get("/:groupId", auth, getMessages);

export default MessageRouter;
