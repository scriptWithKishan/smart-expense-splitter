import api from "./api";

export const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create group";
  }
};

export const joinGroup = async (groupId) => {
  try {
    const response = await api.post("/groups/join", { groupId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to join group";
  }
}

export const getUserGroups = async () => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch groups";
  }
};

export const getGroupDetails = async (id) => {
  try {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch group details";
  }
}

export const deleteGroup = async (id) => {
  try {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete group";
  }
}

export const fetchGroupBalances = async (id) => {
  try {
    const response = await api.get(`/groups/${id}/balances`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch balances";
  }
}

export const fetchGroupActivity = async (id) => {
  try {
    const response = await api.get(`/groups/${id}/activity`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch activity";
  }
}
