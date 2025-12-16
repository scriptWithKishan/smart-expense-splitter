import api from "./api";

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to add expense";
  }
}

export const getGroupExpenses = async (groupId) => {
  try {
    const response = await api.get(`/expenses/group/${groupId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch expenses";
  }
}

export const exportExpenses = async (groupId) => {
  try {
    const response = await api.get(`/expenses/export/${groupId}`, {
      responseType: 'blob',
    });

    // Setup download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses-${groupId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    throw error.response?.data?.message || "Failed to export expenses";
  }
}

export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete expense";
  }
}

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await api.put(`/expenses/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update expense";
  }
}
