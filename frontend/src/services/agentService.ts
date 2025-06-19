import api from "./api";

export const invokeAgent = async (message: string) => {
  const response = await api.post("/agent/invoke", { message });
  return response.data;
};
