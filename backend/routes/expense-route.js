import express from "express";
import { addExpense, getGroupExpenses, exportExpenses, deleteExpense, updateExpense } from "../controllers/expense-controller.js";
import auth from "../middleware/auth.js";

const ExpenseRouter = express.Router();

ExpenseRouter.post("/", auth, addExpense);
ExpenseRouter.get("/group/:groupId", auth, getGroupExpenses);
ExpenseRouter.get("/export/:groupId", auth, exportExpenses);
ExpenseRouter.delete("/:id", auth, deleteExpense);
ExpenseRouter.put("/:id", auth, updateExpense);


export default ExpenseRouter;
