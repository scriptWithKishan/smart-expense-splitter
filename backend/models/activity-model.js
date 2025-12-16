import mongoose from "mongoose"

const ActivitySchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, for system events
  action: {
    type: String,
    required: true,
    enum: ["expense_added", "expense_updated", "expense_deleted", "settlement_created", "member_joined", "member_left", "group_updated"]
  },
  description: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of the expense or settlement
  relatedModel: { type: String, enum: ["Expense", "Settlement", "User", "Group"] }
}, {
  timestamps: true
})

const Activity = mongoose.model("Activity", ActivitySchema)

export default Activity
