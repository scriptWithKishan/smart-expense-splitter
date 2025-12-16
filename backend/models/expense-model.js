import mongoose from "mongoose"

const ExpenseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },
  description: String,
  amount: Number,

  paidBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number
  }],

  splitType: {
    type: String,
    enum: ["equal", "percentage", "custom"]
  },

  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    share: Number,
  }],

  category: String,
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true
})

const Expense = mongoose.model("Expense", ExpenseSchema)

export default Expense 
