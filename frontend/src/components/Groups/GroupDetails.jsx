import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Cookies from "js-cookie";
import { getGroupDetails, deleteGroup } from "@/actions/group-actions";
import { getGroupExpenses, deleteExpense, exportExpenses } from "@/actions/expense-actions";
import { sendMessage, getMessages } from "@/actions/message-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus } from "lucide-react";

// Components
import GroupHeader from "./GroupHeader";
import GroupStats from "./GroupStats";
import ExpenseList from "./ExpenseList";
import GroupMembers from "./GroupMembers";
import ActivityTimeline from "./ActivityTimeline";
import AddExpenseModal from "./AddExpenseModal";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [groupData, expenseData] = await Promise.all([
        getGroupDetails(id),
        getGroupExpenses(id)
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get Current User (Safe)
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setCurrentUser(JSON.parse(userCookie));
      } catch (e) { console.error("Error parsing user cookie", e); }
    }
    fetchData();
  }, [id]);


  // Handlers
  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await deleteGroup(id);
        navigate("/dashboard");
      } catch (error) { alert(error); }
    }
  };

  const handleExport = async () => {
    try { await exportExpenses(id); } catch (e) { alert("Export failed"); }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(expenseId);
      fetchData();
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  // Chat Handlers
  useEffect(() => {
    let interval;
    if (isChatOpen) {
      interval = setInterval(async () => {
        try {
          const msgs = await getMessages(id);
          setMessages(msgs);
        } catch (e) { console.error("Polling error", e); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen, id]);

  const handleOpenChat = async () => {
    setIsChatOpen(true);
    setChatLoading(true);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (e) { console.error(e); }
    finally { setChatLoading(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    try {
      const newMsg = await sendMessage({ groupId: id, content: messageInput });
      setMessages(prev => [...prev, newMsg]);
      setMessageInput("");
    } catch (e) { alert("Failed to send"); }
  };


  if (loading) return <div className="p-10 text-center font-bold text-xl">LOADING...</div>;
  if (!group) return <div className="p-10 text-center font-bold text-xl text-red-500">GROUP NOT FOUND</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">

      {/* 1. Header */}
      <GroupHeader
        group={group}
        currentUser={currentUser}
        onDelete={handleDeleteGroup}
        onExport={handleExport}
        onOpenChat={handleOpenChat}
      />

      {/* 2. Stats (Total, Contributions, Settlements) */}
      <GroupStats group={group} expenses={expenses} />

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Expense List */}
        <div className="lg:col-span-2 relative">
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onRefresh={fetchData}
          />
          {/* Floating Add Button for Mobile/Desktop convenience */}
          <div className="mt-8 flex justify-center">
            <Button onClick={() => { setEditingExpense(null); setShowAddModal(true); }} variant="elevated" className="w-full md:w-auto text-lg py-6">
              <Plus className="mr-2 size-5" /> ADD NEW EXPENSE
            </Button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div>
          <GroupMembers members={group.members} />
          <ActivityTimeline groupId={id} />
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddExpenseModal
          group={group}
          initialData={editingExpense}
          onClose={() => { setShowAddModal(false); setEditingExpense(null); }}
          onSuccess={fetchData}
        />
      )}

      {/* Chat Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="bg-white border-l-2 border-black sm:max-w-md w-full p-0 flex flex-col">
          <SheetHeader className="p-4 border-b-2 border-black bg-gray-50">
            <SheetTitle className="text-xl font-black uppercase">Group Chat</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {chatLoading ? <div className="text-center text-gray-400">Loading...</div> : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender._id === currentUser?._id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-medium ${msg.sender._id === currentUser?._id ? 'bg-black text-white' : 'bg-white'}`}>
                    <p className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.sender.name}</p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t-2 border-black bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="bg-white border-2 border-black rounded-none"
              />
              <Button type="submit" size="icon" className="bg-black text-white border-2 border-black rounded-none">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default GroupDetails;

