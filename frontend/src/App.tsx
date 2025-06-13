import React from "react";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
  <>
    {isAuthenticated ? <Dashboard /> : <AuthPage />}
  </>
  );
}
