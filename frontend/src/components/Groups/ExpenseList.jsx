import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const ExpenseList = ({ expenses, onEdit, onDelete, onRefresh }) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block">Recent Expenses</h2>
        <Button variant="ghost" onClick={onRefresh}>Refresh</Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No expenses recorded yet.</p>
        </div>
      ) : (
        expenses.map(expense => (
          <div key={expense._id} className="bg-white border-2 border-black p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
            {/* Left: Date & Description */}
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

            {/* Right: Amount & Actions */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
              <div className="text-right">
                <span className="block font-black text-xl">₹{expense.amount}</span>
                <span className="text-xs font-bold bg-gray-200 px-2 py-0.5">{expense.splitType}</span>
              </div>

              <div className="flex gap-1 ml-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-yellow-100" onClick={() => onEdit(expense)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-100 text-red-500" onClick={() => onDelete(expense._id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;
