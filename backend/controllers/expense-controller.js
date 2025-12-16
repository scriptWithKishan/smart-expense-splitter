import Expense from "../models/expense-model.js";
import Activity from "../models/activity-model.js";


// Add new expense
export const addExpense = async (req, res) => {
  const { description, amount, groupId, category, date, splitType, paidBy, participants } = req.body;

  try {
    const expense = await Expense.create({
      description,
      amount,
      group: groupId,
      category,
      date,
      splitType,
      paidBy, // Expecting array of { user: userId, amount: amount }
      participants, // Expecting array of { user: userId, share: amount }
      createdBy: req.user.id
    });

    // Log Activity
    await Activity.create({
      group: groupId,
      user: req.user.id,
      action: "expense_added",
      description: `${req.user.name} added expense: ${description}`,
      relatedId: expense._id,
      relatedModel: "Expense"
    })

    res.status(201).json(expense);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get expenses for a group
export const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy.user", "name")
      .populate("participants.user", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Export expenses as CSV
export const exportExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy.user", "name")
      .populate("participants.user", "name") // Ensure participants are populated
      .sort({ date: -1 });

    let csv = "Date,Description,Category,Amount,Paid By,Split Type,Details\n";

    expenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      const paidByNames = expense.paidBy.map(p => p.user?.name || "Unknown").join("; ");

      // Create details string: "John: 50; Jane: 50"
      const details = expense.participants.map(p => `${p.user?.name || "Unknown"}: ${p.share}`).join("; ");

      const row = `${date},"${expense.description}","${expense.category}",${expense.amount},"${paidByNames}","${expense.splitType}","${details}"`;
      csv += row + "\n";
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`expenses-${req.params.groupId}.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Authorization check (optional: simple check if user belongs to group or is creator)
    // For now, assuming any group member can delete

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
