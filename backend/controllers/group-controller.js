import Group from "../models/group-model.js";
import Expense from "../models/expense-model.js";
import Activity from "../models/activity-model.js";
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

// Get Group Balances (Settlements)
// Get Group Balances (Settlements)
export const getGroupBalances = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch all expenses for this group
    const expenses = await Expense.find({ group: id });

    // 2. Initialize balances dictionary
    const balances = {};

    // 3. Calculate Net Balances
    expenses.forEach((expense) => {
      // CREDIT: Who paid? (They get positive balance)
      if (expense.paidBy) {
        expense.paidBy.forEach(payer => {
          if (payer.user && payer.amount) {
            const userId = payer.user.toString();
            balances[userId] = (balances[userId] || 0) + payer.amount;
          }
        });
      }

      // DEBIT: Who owes? (They get negative balance)
      if (expense.participants) {
        expense.participants.forEach(participant => {
          if (participant.user && participant.share) {
            const userId = participant.user.toString();
            balances[userId] = (balances[userId] || 0) - participant.share;
          }
        });
      }
    });

    // 4. Separate into Debtors (-) and Creditors (+)
    let debtors = [];
    let creditors = [];

    // Use a small threshold to ignore floating point dust (e.g., 0.0000001)
    const THRESHOLD = 0.01;

    Object.keys(balances).forEach(userId => {
      const amount = balances[userId];
      if (amount < -THRESHOLD) {
        debtors.push({ userId, amount });
      } else if (amount > THRESHOLD) {
        creditors.push({ userId, amount });
      }
    });

    // 5. Sort for Greedy Settlement (Largest amounts first minimize transaction count)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (example: -100 before -10)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (example: 100 before 10)

    const settlements = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    // 6. Match Logic
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // The amount to settle is the minimum of what the debtor owes vs what the creditor is owed
      const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

      // Add settlement
      // Round to 2 decimals for display
      const displayAmount = Math.round(amountToSettle * 100) / 100;

      if (displayAmount > 0) {
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: displayAmount
        });
      }

      // Adjust remaining balances
      debtor.amount += amountToSettle;
      creditor.amount -= amountToSettle;

      // Check if settled (within threshold)
      if (Math.abs(debtor.amount) < THRESHOLD) i++;
      if (creditor.amount < THRESHOLD) j++;
    }

    // 7. Populate User Names
    const User = (await import("../models/user-model.js")).default;
    const populatedSettlements = await Promise.all(
      settlements.map(async (s) => {
        const fromUser = await User.findById(s.from).select("name email");
        const toUser = await User.findById(s.to).select("name email");

        if (!fromUser || !toUser) return null; // Handle deleted users safely

        return {
          from: fromUser,
          to: toUser,
          amount: s.amount
        };
      })
    );

    res.json(populatedSettlements.filter(s => s !== null));

  } catch (error) {
    console.error("Settlement Calculation Error:", error);
    res.status(500).json({ message: "Failed to calculate settlements" });
  }
};

// Get Group Activity
export const getGroupActivity = async (req, res) => {
  try {
    const activities = await Activity.find({ group: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
