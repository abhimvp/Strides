import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { loginUser } from "../services/authService";
import { UserCreate } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   console.log("AuthProvider initialized");
//   console.log(" localSTorage : ", localStorage); // TBD
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = async (formData: FormData) => {
    try {
      const data = await loginUser(formData);
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
    } catch (error) {
      console.error("Login failed:", error);
      // Re-throw the error so the UI component can handle it
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    // We might want to also clear user data here in the future
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
