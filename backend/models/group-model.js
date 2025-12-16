import mongoose from "mongoose"

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Group"
  },
  groupId: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ["trip", "household", "event", "other"],
    default: "other"
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "member"], default: "member" }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true
})

const Group = mongoose.model("Group", GroupSchema)

export default Group 
