import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getGroupDetails, deleteGroup } from "@/actions/group-actions";
import { getGroupExpenses, addExpense, exportExpenses, deleteExpense, updateExpense } from "@/actions/expense-actions";
import { sendMessage, getMessages } from "@/actions/message-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Copy, RefreshCw, Trash2, Pencil, MessageSquare, Send } from "lucide-react";

// Helper for copy to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert("Copied to clipboard!");
}

const AddExpenseModal = ({ group, onClose, onSuccess, initialData = null }) => {
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [paidBy, setPaidBy] = useState(initialData?.paidBy[0]?.user._id || initialData?.paidBy[0]?.user || group.members[0]?.user?._id || "");
  const [splitType, setSplitType] = useState(initialData?.splitType || "equal");
  const [participants, setParticipants] = useState(
    group.members.map(m => {
      const existing = initialData?.participants.find(p => (p.user._id || p.user) === m.user._id);
      return {
        user: m.user._id,
        checked: !!existing,
        share: existing ? existing.share : 0
      }
    })
  );
  const [loading, setLoading] = useState(false);

  // Handle initial splitting calculation
  useEffect(() => {
    if (!amount) return;
    // If editing and splitType/amount hasn't changed from initial, don't recalculate equal split to preserve custom tweaks
    // But for now, simple logic:
    const totalAmount = parseFloat(amount);
    const activeParticipants = participants.filter(p => p.checked);

    if (splitType === "equal" && activeParticipants.length > 0) {
      const share = (totalAmount / activeParticipants.length).toFixed(2);
      // Distribute equal share
      setParticipants(prev => prev.map(p => ({
        ...p,
        share: p.checked ? share : 0
      })));
    }
  }, [amount, splitType, participants.map(p => p.checked).join(',')]);


  const handleShareChange = (userId, value) => {
    setParticipants(prev => prev.map(p => p.user === userId ? { ...p, share: value } : p));
  };

  const handleCheckboxChange = (userId) => {
    setParticipants(prev => prev.map(p => p.user === userId ? { ...p, checked: !p.checked } : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate totals matches amount (roughly)
      const activeParts = participants.filter(p => p.checked);

      if (splitType === 'percentage') {
        const totalShare = activeParts.reduce((sum, p) => sum + parseFloat(p.share || 0), 0);
        if (Math.abs(totalShare - 100) > 0.1) {
          alert(`Total percentage must equal 100%. Current: ${totalShare}%`);
          setLoading(false);
          return;
        }
      } else if (splitType === 'custom') {
        const totalShare = activeParts.reduce((sum, p) => sum + parseFloat(p.share || 0), 0);
        if (Math.abs(totalShare - parseFloat(amount)) > 0.1) {
          alert(`Total split amount must equal total expense amount (₹${amount}). Current: ₹${totalShare}`);
          setLoading(false);
          return;
        }
      }

      // Construct payload
      const payload = {
        groupId: group._id,
        description,
        amount: parseFloat(amount),
        category: "General", // simplified for now
        splitType,
        paidBy: [{ user: paidBy, amount: parseFloat(amount) }], // Simplify to single payer for now
        participants: activeParts.map(p => ({
          user: p.user,
          share: splitType === 'percentage'
            ? (parseFloat(amount) * parseFloat(p.share) / 100)
            : parseFloat(p.share)
        }))
      };

      if (initialData) {
        await updateExpense(initialData._id, payload);
      } else {
        await addExpense(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err); // Simple alert for error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 uppercase">{initialData ? "Edit Expense" : "Add Expense"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold block mb-1">DESCRIPTION</label>
            <Input required value={description} onChange={e => setDescription(e.target.value)} placeholder="Dinner, Taxi, etc." />
          </div>
          <div>
            <label className="font-bold block mb-1">AMOUNT</label>
            <Input required type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="font-bold block mb-1">PAID BY</label>
            <select className="w-full h-10 border-2 border-black px-2 bg-white" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
              {group.members.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t-2 border-black pt-4">
            <label className="font-bold block mb-2">SPLIT BY</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {['equal', 'percentage', 'custom'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`px-3 py-1 border-2 border-black text-sm font-bold uppercase transition-all ${splitType === type ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {group.members.map(m => {
                const p = participants.find(part => part.user === m.user._id);
                return (
                  <div key={m.user._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p?.checked}
                      onChange={() => handleCheckboxChange(m.user._id)}
                      className="size-5 border-2 border-black rounded-none accent-black"
                    />
                    <span className="flex-1 font-medium">{m.user.name}</span>
                    {splitType === 'equal' && (
                      <span className="font-mono">{p?.checked ? p.share : '-'}</span>
                    )}
                    {splitType !== 'equal' && (
                      <Input
                        type="number"
                        value={p?.share}
                        onChange={(e) => handleShareChange(m.user._id, e.target.value)}
                        className="w-24 h-8"
                        disabled={!p?.checked}
                        placeholder={splitType === 'percentage' ? '%' : '₹'}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <Button type="button" variant="outline" onClick={onClose}>CANCEL</Button>
            <Button type="submit" variant="elevated" disabled={loading}>
              {loading ? "SAVING..." : (initialData ? "UPDATE" : "ADD EXPENSE")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Calculate Settlements
  const calculateSettlements = (groupMembers, expenseList) => {
    const balances = {};
    groupMembers.forEach(m => balances[m.user._id] = 0);

    expenseList.forEach(exp => {
      const payerId = exp.paidBy[0]?.user?._id || exp.paidBy[0]?.user;
      if (payerId) balances[payerId] += exp.amount;

      exp.participants.forEach(p => {
        const userId = p.user._id || p.user;
        if (balances[userId] !== undefined) balances[userId] -= p.share;
      });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([userId, amount]) => {
      if (amount < -0.01) debtors.push({ userId, amount });
      if (amount > 0.01) creditors.push({ userId, amount });
    });

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

      const fromUser = groupMembers.find(m => m.user._id === debtor.userId)?.user;
      const toUser = groupMembers.find(m => m.user._id === creditor.userId)?.user;

      if (fromUser && toUser) {
        transactions.push({
          from: fromUser,
          to: toUser,
          amount: amount.toFixed(2)
        });
      }

      debtor.amount += amount;
      creditor.amount -= amount;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return transactions;
  }

  const fetchData = async () => {
    try {
      const [groupData, expenseData] = await Promise.all([
        getGroupDetails(id),
        getGroupExpenses(id)
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
      setDebts(calculateSettlements(groupData.members, expenseData));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Get current user from cookies
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    if (userCookie) {
      try {
        setCurrentUser(JSON.parse(decodeURIComponent(userCookie.split('=')[1])));
      } catch (e) { console.error("Error parsing user cookie", e); }
    }
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await deleteGroup(id);
        navigate("/dashboard");
      } catch (error) {
        alert(error);
      }
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Delete this expense?")) {
      try {
        await deleteExpense(expenseId);
        fetchData();
      } catch (error) {
        alert(error);
      }
    }
  }

  const handleFetchMessages = async () => {
    setChatLoading(true);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to fetch messages");
    } finally {
      setChatLoading(false);
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    try {
      const newMsg = await sendMessage({ groupId: id, content: messageInput });
      setMessages([...messages, newMsg]);
      setMessageInput("");
    } catch (error) {
      alert('Failed to send');
    }
  }

  const handleExport = async () => {
    try {
      await exportExpenses(id);
    } catch (error) {
      alert("Failed to export");
    }
  }

  if (loading) return <div className="p-10 text-center font-bold text-xl">LOADING DATE...</div>;
  if (!group) return <div className="p-10 text-center font-bold text-xl text-red-500">GROUP NOT FOUND</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="bg-white border-2 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase mb-2">{group.name}</h1>
            <p className="text-gray-600 font-medium mb-4">{group.description}</p>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="bg-black text-white px-3 py-1">{group.type.toUpperCase()}</span>
              <span className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => copyToClipboard(group.groupId)}>
                ID: {group.groupId} <Copy className="size-4" />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Show delete button only if current user is creator */}
            {group.createdBy && (currentUser?._id === group.createdBy._id || currentUser?._id === group.createdBy) && (
              <Button variant="elevated" onClick={handleDelete} className="border-2 border-red-900 bg-red-500">
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button variant="elevated" onClick={handleExport}>
              <Download className="mr-2 size-4" /> CSV
            </Button>

            <Sheet onOpenChange={(open) => { if (open) handleFetchMessages() }}>
              <SheetTrigger asChild>
                <Button variant="elevated">
                  <MessageSquare className="mr-2 size-4" /> CHAT
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white border-l-2 border-black sm:max-w-md w-full p-0 flex flex-col">
                <SheetHeader className="p-4 border-b-2 border-black bg-gray-50">
                  <SheetTitle className="text-xl font-black uppercase">Group Chat</SheetTitle>
                </SheetHeader>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {chatLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading chats...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 italic">No messages yet. Say hi!</div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender._id === currentUser?._id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium ${msg.sender._id === currentUser?._id ? 'bg-black text-white' : 'bg-white'}`}>
                          <p className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.sender.name}</p>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-black bg-gray-50">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-white border-2 border-black rounded-none focus-visible:ring-0"
                    />
                    <Button type="submit" size="icon" className="bg-black text-white border-2 border-black rounded-none hover:bg-gray-800 h-10 w-12 shrink-0">
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={() => setShowAddModal(true)} variant="elevated">
              <Plus className="mr-2 size-4" /> ADD EXPENSE
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            <p className="text-sm font-medium opacity-80 mb-1">TOTAL SPENT</p>
            <p className="text-3xl lg:text-4xl font-black truncate" title={`₹${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`}>
              ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </p>
          </div>

          {/* Member Contributions */}
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-bold opacity-80 mb-4">CONTRIBUTIONS</p>
            <div className="space-y-3">
              {group.members.map(m => {
                const totalPaid = expenses
                  .filter(e => (e.paidBy[0]?.user?._id || e.paidBy[0]?.user) === m.user._id)
                  .reduce((sum, e) => sum + e.amount, 0);
                const maxPaid = Math.max(...group.members.map(mem => expenses.filter(e => (e.paidBy[0]?.user?._id || e.paidBy[0]?.user) === mem.user._id).reduce((s, x) => s + x.amount, 0))) || 1;
                const width = (totalPaid / maxPaid) * 100;

                return (
                  <div key={m.user._id}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{m.user.name}</span>
                      <span>₹{totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 border border-black">
                      <div className="h-full bg-black" style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settlements / Debts */}
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-1 md:col-span-2 lg:col-span-1">
            <p className="text-sm font-bold opacity-80 mb-4">SETTLEMENTS (WHO OWES WHO)</p>
            {debts.length === 0 ? (
              <div className="text-gray-500 font-medium text-sm italic">Type "All settled up!"</div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {debts.map((debt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-bold border-l-4 border-black pl-3 py-1 bg-gray-50">
                    <span className="text-red-600">{debt.from.name}</span>
                    <span className="text-gray-400 text-xs">owes</span>
                    <span className="text-green-600">{debt.to.name}</span>
                    <span className="ml-auto font-black bg-black text-white px-2 py-0.5">₹{debt.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block">Recent Expenses</h2>
            <Button variant="ghost" onClick={fetchData}><RefreshCw className="size-4" /></Button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No expenses recorded yet.</p>
            </div>
          ) : (
            expenses.map(expense => (
              <div key={expense._id} className="bg-white border-2 border-black p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="bg-white border-2 border-black w-16 h-16 flex flex-col items-center justify-center font-bold leading-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] uppercase">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl">{new Date(expense.date).getDate()}</span>
                    <span className="text-[9px] text-gray-500">{new Date(expense.date).getFullYear()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{expense.description}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      <span className="font-bold">{expense.paidBy[0]?.user?.name || "Someone"}</span> paid ₹{expense.amount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                  <div className="text-right">
                    <span className="block font-black text-xl">₹{expense.amount}</span>
                    <span className="text-xs font-bold bg-gray-200 px-2 py-0.5">{expense.splitType}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 ml-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-yellow-100" onClick={() => { setEditingExpense(expense); setShowAddModal(true); }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-100 text-red-500" onClick={() => handleDeleteExpense(expense._id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {/* Analytics Section */}


        {/* Sidebar / Members */}
        <div>
          <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block mb-4">Members</h2>
          <div className="bg-white border-2 border-black p-4 space-y-2">
            {group.members.map(member => (
              <div key={member.user._id} className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-0">
                <div className="size-8 bg-black rounded-full text-white flex items-center justify-center font-bold">
                  {member.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold leading-tight">{member.user.name}</p>
                  <p className="text-xs text-gray-400 font-medium uppercase">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddExpenseModal
          group={group}
          initialData={editingExpense}
          onClose={() => { setShowAddModal(false); setEditingExpense(null); }}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}


export default GroupDetails
