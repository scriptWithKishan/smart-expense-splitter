import { useEffect, useState } from "react";
import { fetchGroupBalances } from "@/actions/group-actions";
import { ArrowRight } from "lucide-react";

const Settlements = ({ groupId }) => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, [groupId]);

  const fetchBalances = async () => {
    try {
      const data = await fetchGroupBalances(groupId);
      setSettlements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-bold mb-4">OPTIMIZED SETTLEMENTS</h3>
      {settlements.length === 0 ? (
        <p className="text-gray-500">No debts to settle. You are all square!</p>
      ) : (
        <div className="space-y-4">
          {settlements.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-black bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-bold">{s.from?.name || "Unknown"}</span>
                <span className="text-gray-500 text-sm">owes</span>
                <span className="font-bold">{s.to?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold text-lg text-green-600">
                ₹{s.amount}
                <ArrowRight className="h-4 w-4 text-black" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settlements;
