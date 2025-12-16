import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ["text", "system"], // 'system' for activity logs like "User added an expense"
    default: "text"
  },
}, {
  timestamps: true
})

const Message = mongoose.model("Message", MessageSchema)

export default Message
