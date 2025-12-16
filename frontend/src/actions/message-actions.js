import api from "./api";

export const sendMessage = async (data) => {
  try {
    const response = await api.post("/messages", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to send message";
  }
}

export const getMessages = async (groupId) => {
  try {
    const response = await api.get(`/messages/group/${groupId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch messages";
  }
}
