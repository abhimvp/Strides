import axios from "axios";
import { UserCreate } from "../types";

const API_URL = "http://localhost:8000/api/auth";

export const signupUser = async (userData: UserCreate) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

export const loginUser = async (userData: FormData) => {
  const response = await axios.post(`${API_URL}/login`, userData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};
// Note: The login endpoint in FastAPI's OAuth2PasswordRequestForm expects form data,
// link to form data info : https://developer.mozilla.org/en-US/docs/Web/API/FormData
// not JSON, which is why the loginUser function is set up differently.
