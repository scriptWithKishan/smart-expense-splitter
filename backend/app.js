import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Initialize app
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
import connectDB from "./config/db.js"
connectDB();

// Routes
import UserRouter from "./routes/user-route.js";
import GroupRouter from "./routes/group-route.js";
import ExpenseRouter from "./routes/expense-route.js";
import MessageRouter from "./routes/message-route.js";

app.use("/api/users", UserRouter);
app.use("/api/groups", GroupRouter);
app.use("/api/expenses", ExpenseRouter);
app.use("/api/messages", MessageRouter);


// Error handling
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})