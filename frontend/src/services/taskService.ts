import type { Category } from "../types";
import api from "./api";

// Fetches the logged-in user's tasks
export const getTasks = async () => {
  const response = await api.get("/tasks/");
  return response.data;
};

// Creates the initial set of tasks for a new user
export const createInitialTasks = async (categories: Category[]) => {
  const response = await api.post("/tasks/", categories);
  return response.data;
};

// Updates the user's entire task list (e.g., after toggling a task)
export const updateTasks = async (categories: Category[]) => {
  const response = await api.put("/tasks/", categories);
  return response.data;
};

// Fetches task completion history for a specific month
export const getMonthlyHistory = async (year: number, month: number) => {
  const response = await api.get('/tasks/history', {
    params: { year, month }
  });
  return response.data;
};
