import Message from "../models/message-model.js";

// Send a message
export const sendMessage = async (req, res) => {
  const { groupId, content } = req.body;

  try {
    const message = await Message.create({
      group: groupId,
      sender: req.user.id,
      content
    });

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "name email");

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get messages for a group
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 }); // Oldest first

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
