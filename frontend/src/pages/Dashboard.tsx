// src/pages/Dashboard.tsx
import { useState } from "react";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { TaskView } from "./TaskView";
import { ExpensesViewNew } from "./ExpensesViewNew";
import { TodoView } from "../components/todos/TodoView"; // 1. Import the new view

type MainView = "tasks" | "expenses" | "todos"; // 2. Add 'todos' to the view type

export const Dashboard = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<MainView>("tasks");

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-6xl">
        {" "}
        {/* Increased max-width for new layout */}
        {/* Main Header */}
        <div className="flex justify-between items-start mb-4">
          <Header />
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={logout}
              className="bg-black text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Top-Level Navigation Tabs */}
        <div className="mb-8 border-b-2 border-black">
          <nav className="-mb-0.5 flex space-x-8">
            <button
              onClick={() => setCurrentView("tasks")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "tasks"
                  ? "border-black text-black"
                  : "border-transparent text-black hover:text-black"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setCurrentView("expenses")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "expenses"
                  ? "border-black text-black"
                  : "border-transparent text-black hover:text-black"
              }`}
            >
              Expenses
            </button>
            {/* 3. Add the new To-Do Board button */}
            <button
              onClick={() => setCurrentView("todos")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "todos"
                  ? "border-black text-black"
                  : "border-transparent text-black hover:text-black"
              }`}
            >
              To-Do Board
            </button>
          </nav>
        </div>
        {/* Conditionally Render the Active View */}
        <div>
          {currentView === "tasks" && <TaskView />}
          {currentView === "expenses" && <ExpensesViewNew />}
          {/* 4. Add the new conditional render for the To-Do View */}
          {currentView === "todos" && <TodoView />}
        </div>
      </div>
    </div>
  );
};
