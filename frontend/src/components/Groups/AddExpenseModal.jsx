import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addExpense, updateExpense } from "@/actions/expense-actions";

const AddExpenseModal = ({ group, onClose, onSuccess, initialData = null }) => {
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [paidBy, setPaidBy] = useState(initialData?.paidBy[0]?.user._id || initialData?.paidBy[0]?.user || group.members[0]?.user?._id || "");
  const [splitType, setSplitType] = useState(initialData?.splitType || "equal");

  // Initialize participants: Default to ALL checked for new expense
  const [participants, setParticipants] = useState(
    group.members.map(m => {
      // Check if this member was in the original expense (Edit Mode)
      // handling both populated object and direct ID
      const existing = initialData?.participants.find(p => (p.user._id || p.user) === m.user._id);

      // If Editing: Start checked only if they were in the list.
      // If Adding: Start checked (true) for everyone.
      const isChecked = initialData ? !!existing : true;

      return {
        user: m.user._id,
        name: m.user.name,
        checked: isChecked,
        share: existing ? existing.share : 0
      }
    })
  );

  const [loading, setLoading] = useState(false);

  // Effect: Recalculate Equal Shares when Amount or Checked Participants change
  useEffect(() => {
    if (splitType === "equal" && amount) {
      const activeCount = participants.filter(p => p.checked).length;
      if (activeCount > 0) {
        const share = (parseFloat(amount) / activeCount).toFixed(2);
        setParticipants(prev => prev.map(p => ({
          ...p,
          share: p.checked ? share : 0
        })));
      }
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
      const activeParts = participants.filter(p => p.checked);
      if (activeParts.length === 0) {
        throw "Select at least one person to split with.";
      }

      // Validation
      const totalShare = activeParts.reduce((sum, p) => sum + parseFloat(p.share || 0), 0);
      if (splitType === 'percentage' && Math.abs(totalShare - 100) > 0.1) {
        throw `Total percentage must equal 100%. Current: ${totalShare}%`;
      }
      if (splitType === 'custom' && Math.abs(totalShare - parseFloat(amount)) > 0.1) {
        throw `Total split amount must equal ₹${amount}. Current: ₹${totalShare}`;
      }

      const payload = {
        groupId: group._id,
        description,
        amount: parseFloat(amount),
        category: "General",
        splitType,
        paidBy: [{ user: paidBy, amount: parseFloat(amount) }],
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
      alert(err);
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
              {participants.map(p => (
                <div key={p.user} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.checked}
                    onChange={() => handleCheckboxChange(p.user)}
                    className="size-5 border-2 border-black rounded-none accent-black"
                  />
                  <span className="flex-1 font-medium">{p.name}</span>
                  {splitType === 'equal' && (
                    <span className="font-mono">{p.checked ? p.share : '-'}</span>
                  )}
                  {splitType !== 'equal' && (
                    <Input
                      type="number"
                      value={p.share}
                      onChange={(e) => handleShareChange(p.user, e.target.value)}
                      className="w-24 h-8"
                      disabled={!p.checked}
                      placeholder={splitType === 'percentage' ? '%' : '₹'}
                    />
                  )}
                </div>
              ))}
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
  );
}

export default AddExpenseModal;
