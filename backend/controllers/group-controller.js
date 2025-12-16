import Group from "../models/group-model.js";
import shortid from "shortid";

// Create a new group
export const createGroup = async (req, res) => {
  const { name, type, description } = req.body;

  try {
    const group = await Group.create({
      name,
      type,
      description,
      groupId: shortid.generate(),
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: "admin" }],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user groups
export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ "members.user": req.user.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get group details
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members.user", "name email")
      .populate("createdBy", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member) => member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(401).json({ message: "Not authorized to view this group" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Join group via Group ID
export const joinGroup = async (req, res) => {
  const { groupId } = req.body;

  try {
    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if already a member
    if (group.members.some(member => member.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    group.members.push({ user: req.user.id, role: "member" });
    await group.save();

    res.json(group);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: "Only the admin can delete this group" });
    }

    await group.deleteOne();
    res.json({ message: "Group removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
