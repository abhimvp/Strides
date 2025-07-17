// src/pages/Dashboard.tsx
import { useState } from "react";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { TaskView } from "./TaskView";
import { ExpensesView } from "./ExpensesView";
import { TodoView } from "../components/todos/TodoView"; // 1. Import the new view
import { TripsView } from "../components/trips/TripsView"; // Import the trips view
import { invokeAgent } from "../services/agentService";
import {
  CheckSquare,
  CreditCard,
  ListChecks,
  House,
  Robot,
  MapPin,
} from "phosphor-react";

type MainView = "home" | "tasks" | "expenses" | "todos" | "trips"; // Add 'trips' to the view type

export const Dashboard = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<MainView>("home");
  const [agentInput, setAgentInput] = useState<string>("");
  const [agentResponse, setAgentResponse] = useState<string>("");
  const [isAgentLoading, setIsAgentLoading] = useState<boolean>(false);

  const sidebarItems = [
    {
      id: "home",
      title: "Home",
      icon: House,
      color: "text-gray-600",
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: CheckSquare,
      color: "text-gray-600",
    },
    {
      id: "expenses",
      title: "Expenses",
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      id: "todos",
      title: "To-Do Board",
      icon: ListChecks,
      color: "text-purple-600",
    },
    {
      id: "trips",
      title: "Trips",
      icon: MapPin,
      color: "text-blue-600",
    },
  ];

  const cardData = [
    {
      id: "tasks",
      title: "Tasks",
      icon: CheckSquare,
      description: "Manage your daily tasks and goals",
      accentColor: "bg-yellow-100 text-gray-600",
    },
    {
      id: "expenses",
      title: "Expenses",
      icon: CreditCard,
      description: "Track your spending and budgets",
      accentColor: "bg-green-100 text-green-600",
    },
    {
      id: "todos",
      title: "To-Do Board",
      icon: ListChecks,
      description: "Organize your projects and workflows",
      accentColor: "bg-purple-100 text-purple-600",
    },
    {
      id: "trips",
      title: "Trips & Outings",
      icon: MapPin,
      description: "Plan and track your trips and outings",
      accentColor: "bg-blue-100 text-blue-600",
    },
  ];

  const renderSidebar = () => (
    <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-2">
      {sidebarItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as MainView)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-gray-100 border-2 border-gray-300"
                : "hover:bg-gray-50 border-2 border-transparent"
            }`}
          >
            <IconComponent
              size={24}
              className={`mb-1 ${
                isActive
                  ? "text-gray-800"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isActive
                  ? "text-gray-800"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            >
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );

  const handleAgentSubmit = async () => {
    if (!agentInput.trim()) return;

    setIsAgentLoading(true);
    try {
      const response = await invokeAgent(agentInput);
      // Handle different response formats
      let responseText = "";
      if (typeof response === "string") {
        responseText = response;
      } else if (response?.response) {
        responseText = response.response;
      } else if (response?.message) {
        responseText = response.message;
      } else {
        responseText = JSON.stringify(response);
      }
      setAgentResponse(responseText);
      setAgentInput("");
    } catch (error) {
      console.error("Agent error:", error);
      setAgentResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsAgentLoading(false);
    }
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto">
      {/* Centered AI Agent Section */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <Robot size={28} className="text-gray-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Let Agent do the work for you
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <textarea
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder="Tell me what you want to accomplish..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                rows={4}
              />
              <button
                onClick={handleAgentSubmit}
                disabled={isAgentLoading || !agentInput.trim()}
                className="w-full bg-black text-white py-3 px-6 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAgentLoading ? "Working..." : "Get Help"}
              </button>
            </div>

            {/* Response Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Agent Response:
              </h4>
              <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[120px]">
                {isAgentLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Thinking...</div>
                  </div>
                ) : agentResponse ? (
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {agentResponse}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Agent response will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Your Workspace
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cardData.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setCurrentView(card.id as MainView)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl ${card.accentColor}`}>
                    <IconComponent size={24} />
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Content based on current view */}
        <div>
          {currentView === "tasks" && <TaskView />}
          {currentView === "expenses" && <ExpensesView />}
          {currentView === "todos" && <TodoView />}
          {currentView === "trips" && <TripsView />}
        </div>
      </div>

      {/* Side Column - Will be managed by individual components */}
      {currentView !== "tasks" &&
        currentView !== "expenses" &&
        currentView !== "todos" &&
        currentView !== "trips" && (
          <div className="w-80 space-y-6">
            {/* AI Agent Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Let Agent help with {currentView}
                </h3>
                <Robot size={20} className="text-gray-600" />
              </div>
              <div className="space-y-3">
                <textarea
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder={`Ask for help with your ${currentView}...`}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAgentSubmit}
                  disabled={isAgentLoading || !agentInput.trim()}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAgentLoading ? "Working..." : "Get Help"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-black flex">
      {/* Left Sidebar */}
      {renderSidebar()}

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
          {/* Main Header - Only show on home screen */}
          {currentView === "home" && (
            <div className="flex justify-between items-start mb-8">
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
          )}

          {/* Header for detail views */}
          {currentView !== "home" && (
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 capitalize">
                  {currentView}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentView === "tasks" &&
                    "Manage your daily tasks and goals"}
                  {currentView === "expenses" &&
                    "Track your spending and budgets"}
                  {currentView === "todos" &&
                    "Organize your projects and workflows"}
                  {currentView === "trips" &&
                    "Plan and track your trips and outings"}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-black text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-all"
              >
                Logout
              </button>
            </div>
          )}

          {/* Render based on current view */}
          {currentView === "home" ? renderHome() : renderDetailView()}
        </div>
      </div>
    </div>
  );
};
