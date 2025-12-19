import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Download, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Assuming you have this helper or will pass it in
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert("Copied!");
};

const GroupHeader = ({
  group,
  currentUser,
  onDelete,
  onExport,
  onOpenChat
}) => {
  if (!group) return null;

  const isCreator = group.createdBy && (currentUser?._id === group.createdBy._id || currentUser?._id === group.createdBy);

  return (
    <div className="bg-white border-2 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase mb-2">{group.name}</h1>
          <p className="text-gray-600 font-medium mb-4">{group.description}</p>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="bg-black text-white px-3 py-1">{group.type?.toUpperCase()}</span>
            <span className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => copyToClipboard(group.groupId)}>
              ID: {group.groupId} <Copy className="size-4" />
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Delete Button (Creator Only) */}
          {isCreator && (
            <Button variant="elevated" onClick={onDelete} className="border-2 border-red-900 bg-red-500 text-white hover:bg-red-600">
              <Trash2 className="size-4" />
            </Button>
          )}

          <Button variant="elevated" onClick={onExport}>
            <Download className="mr-2 size-4" /> CSV
          </Button>

          <Button variant="elevated" onClick={onOpenChat}>
            <MessageSquare className="mr-2 size-4" /> CHAT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
