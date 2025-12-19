import { useEffect, useState } from "react";
import { fetchGroupActivity } from "@/actions/group-actions";

const ActivityTimeline = ({ groupId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [groupId]);

  const fetchActivity = async () => {
    try {
      const data = await fetchGroupActivity(groupId);
      setActivities(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
      <h3 className="text-xl font-bold mb-4">ACTIVITY TIMELINE</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <p className="text-gray-500">No recent activity.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="border-l-2 border-black pl-4 py-1 relative">
              <div className="absolute -left-[5px] top-3 w-2 h-2 bg-black rounded-full" />
              <p className="font-medium text-sm text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
