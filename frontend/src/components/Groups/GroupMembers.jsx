const GroupMembers = ({ members }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold uppercase border-b-4 border-black inline-block mb-4">Members</h2>
      <div className="bg-white border-2 border-black p-4 space-y-2 mb-8">
        {members.map(member => (
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
  );
};

export default GroupMembers;
