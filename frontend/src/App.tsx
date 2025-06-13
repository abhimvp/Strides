import React from "react";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { Toaster } from "react-hot-toast"; // <-- Import the component

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </>
  );
}
