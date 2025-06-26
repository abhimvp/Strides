import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen transition-colors duration-300 theme-bg-primary theme-text-primary">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "theme-bg-secondary theme-text-primary",
          duration: 3000,
        }}
      />
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
