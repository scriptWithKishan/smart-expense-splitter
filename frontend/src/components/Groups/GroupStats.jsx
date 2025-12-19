import Settlements from "./Settlements";

const GroupStats = ({ group, expenses }) => {
  if (!group) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Spent */}
        <div className="bg-black text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="text-sm font-medium opacity-80 mb-1">TOTAL SPENT</p>
          <p className="text-3xl lg:text-4xl font-black truncate" title={`₹${totalSpent.toFixed(2)}`}>
            ₹{totalSpent.toFixed(2)}
          </p>
        </div>

        {/* Member Contributions */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-bold opacity-80 mb-4">CONTRIBUTIONS</p>
          <div className="space-y-3">
            {group.members.map(m => {
              const totalPaid = expenses
                .filter(e => {
                  const payerId = e.paidBy[0]?.user._id || e.paidBy[0]?.user;
                  return payerId === m.user._id
                })
                .reduce((sum, e) => sum + e.amount, 0);

              // Max paid Logic for bar width
              const maxPaid = Math.max(...group.members.map(mem =>
                expenses.filter(e => {
                  const pid = e.paidBy[0]?.user._id || e.paidBy[0]?.user;
                  return pid === mem.user._id
                }).reduce((s, x) => s + x.amount, 0)
              )) || 1;

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

        {/* Settlements */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <Settlements groupId={group._id} />
        </div>
      </div>
    </div>
  );
};

export default GroupStats;
