import api from "./api";
import type {
  TodoItem,
  CreateTodoData,
  UpdateTodoData,
  CreateTodoLogData,
} from "../types";

// Helper to transform the response to TodoItem
const transformTodoItem = (item: any): TodoItem => {
  // Backend is sending '_id' but we need 'id' for our TodoItem interface
  const { _id, ...rest } = item;
  return { id: _id, ...rest };
};

export const getTodos = async (): Promise<TodoItem[]> => {
  const response = await api.get("/todos/");

  return response.data.map(transformTodoItem);
};

export const createTodo = async (data: CreateTodoData): Promise<TodoItem> => {
  const response = await api.post("/todos/", data);
  return transformTodoItem(response.data);
};

export const updateTodo = async (
  id: string,
  data: UpdateTodoData
): Promise<TodoItem> => {
  const response = await api.put(`/todos/${id}`, data);
  return transformTodoItem(response.data);
};

export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`/todos/${id}`);
};

export const addTodoLog = async (
  todoId: string,
  data: CreateTodoLogData
): Promise<TodoItem> => {
  const response = await api.post(`/todos/${todoId}/logs`, data);
  return transformTodoItem(response.data);
};

export const getTodoById = async (id: string): Promise<TodoItem> => {
  const response = await api.get(`/todos/${id}`);
  return transformTodoItem(response.data);
};
