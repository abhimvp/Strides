import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { signupUser } from "../services/authService";
import toast from "react-hot-toast"; // <-- Import the toast function
// Modify the handleSubmit function to call toast.success() or toast.error()
// instead of using alert() or setting an error state.

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing..."); // Show a loading indicator
    try {
      if (isLogin) {
        const formData = new FormData();
        formData.append("username", email); // form expects 'username' for email
        formData.append("password", password);
        await login(formData);
        toast.success("Logged in successfully!");
      } else {
        await signupUser({ email, password });
        toast.success("Signup successful! Please log in.");
        // Automatically switch to login view after successful signup
        setIsLogin(true);
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { detail?: string } } })
          .response;
        errorMessage = response?.data?.detail || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast); // Dismiss the loading indicator
    }
  };

  return (
    <div className="min-h-screen theme-bg-secondary flex flex-col justify-center items-center transition-colors duration-300">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-4xl font-bold text-center theme-text-primary mb-2">
          Strides
        </h1>
        <p className="text-center theme-text-muted mb-8">
          Your daily checkpoint for growth.
        </p>
        <div className="theme-bg-card p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center theme-text-primary mb-6">
            {isLogin ? "Log In" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold theme-text-secondary block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border theme-border rounded-md mt-1 theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold theme-text-secondary block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border theme-border rounded-md mt-1 theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold transition-colors"
              >
                {isLogin ? "Log In" : "Create Account"}
              </button>
            </div>
          </form>
          <p className="text-center text-sm mt-6 theme-text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:underline ml-1 font-semibold"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
