import api from "./api";
import Cookies from "js-cookie";

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    if (response.data.token) {
      Cookies.set("token", response.data.token, { expires: 30 });
      Cookies.set("user", JSON.stringify(response.data), { expires: 30 });
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration failed";
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post("/users/login", userData);
    if (response.data.token) {
      Cookies.set("token", response.data.token, { expires: 30 });
      Cookies.set("user", JSON.stringify(response.data), { expires: 30 });
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const logoutUser = () => {
  Cookies.remove("token");
  Cookies.remove("user");
  window.location.href = "/login";
}

export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
}
