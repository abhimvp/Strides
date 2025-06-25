// src/pages/Dashboard.tsx
import React, { useState } from "react";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { TaskView } from "./TaskView";
import { ExpensesView } from "./ExpensesView";
import { TodoView } from "../components/todos/TodoView"; // 1. Import the new view

type MainView = "tasks" | "expenses" | "todos"; // 2. Add 'todos' to the view type

export const Dashboard = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<MainView>("tasks");

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-6xl">
        {" "}
        {/* Increased max-width for new layout */}
        {/* Main Header */}
        <div className="flex justify-between items-start mb-4">
          <Header />
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={logout}
              className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Top-Level Navigation Tabs */}
        <div className="mb-8 border-b-2 border-slate-200">
          <nav className="-mb-0.5 flex space-x-8">
            <button
              onClick={() => setCurrentView("tasks")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "tasks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setCurrentView("expenses")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Expenses
            </button>
            {/* 3. Add the new To-Do Board button */}
            <button
              onClick={() => setCurrentView("todos")}
              className={`py-4 px-1 border-b-4 font-semibold text-xl transition-colors ${
                currentView === "todos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              To-Do Board
            </button>
          </nav>
        </div>
        {/* Conditionally Render the Active View */}
        <div>
          {currentView === "tasks" && <TaskView />}
          {currentView === "expenses" && <ExpensesView />}
          {/* 4. Add the new conditional render for the To-Do View */}
          {currentView === "todos" && <TodoView />}
        </div>
      </div>
    </div>
  );
};
