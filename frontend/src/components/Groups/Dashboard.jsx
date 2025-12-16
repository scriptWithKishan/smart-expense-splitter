import { useState, useEffect } from "react";
import { getUserGroups, createGroup, joinGroup } from "@/actions/group-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { Plus, Users, ArrowRight } from "lucide-react";

// Modal Component for Create/Join
const ActionModal = ({ type, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", description: "", type: "other", groupId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (type === "create") {
        await createGroup(formData);
      } else {
        await joinGroup(formData.groupId);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 uppercase">{type === "create" ? "Create Group" : "Join Group"}</h2>
        {error && <div className="bg-red-100 border-2 border-red-500 text-red-500 p-2 mb-4 font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "create" ? (
            <>
              <div>
                <label className="font-bold block mb-1">GROUP NAME</label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Summer Trip 2024" />
              </div>
              <div>
                <label className="font-bold block mb-1">TYPE</label>
                <select
                  className="w-full h-10 border-2 border-black px-2 bg-white"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="trip">Trip</option>
                  <option value="household">Household</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">DESCRIPTION</label>
                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
              </div>
            </>
          ) : (
            <div>
              <label className="font-bold block mb-1">GROUP ID</label>
              <Input required value={formData.groupId} onChange={e => setFormData({ ...formData, groupId: e.target.value })} placeholder="Enter Group ID" />
            </div>
          )}
          <div className="flex gap-2 justify-end mt-6">
            <Button type="button" variant="elevated" onClick={onClose}>CANCEL</Button>
            <Button type="submit" variant="elevated" disabled={loading}>
              {loading ? "PROCESSING..." : (type === "create" ? "CREATE" : "JOIN")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const GroupCard = ({ group }) => (
  <Link to={`/groups/${group._id}`} className="block">
    <div className="border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase">{group.type}</span>
          <ArrowRight className="size-5" />
        </div>
        <h3 className="text-2xl font-black mb-1 truncate" title={group.name}>{group.name}</h3>
        <p className="text-gray-500 line-clamp-2 text-sm font-medium">{group.description || "No description"}</p>
      </div>
      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center text-sm font-medium text-gray-600">
        <Users className="size-4 mr-2" />
        <span>{group.members.length} Members</span>
      </div>
    </div>
  </Link>
)

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [modalType, setModalType] = useState(null); // 'create' | 'join' | null
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const data = await getUserGroups();
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-black uppercase">Your Groups</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => setModalType("join")} variant="elevated">
            JOIN GROUP
          </Button>
          <Button onClick={() => setModalType("create")} variant="elevated">
            <Plus className="mr-2 size-4" /> CREATE GROUP
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-xl">LOADING YOUR SQUAD...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">NO GROUPS YET</h3>
          <p className="mb-6 text-gray-500">Create a group or join one to start splitting bills!</p>
          <Button onClick={() => setModalType("create")} variant="elevated">CREATE YOUR FIRST GROUP</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      {modalType && (
        <ActionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSuccess={fetchGroups}
        />
      )}
    </div>
  )
}

export default Dashboard;
