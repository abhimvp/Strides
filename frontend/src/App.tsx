import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-black">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "bg-white text-black border border-gray-300",
          duration: 3000,
        }}
      />
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </div>
  );
}
