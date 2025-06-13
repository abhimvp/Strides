import React, { useState } from "react";
import type { Task, TasksByCategory } from "../types";
import { getWeekDays } from "../utils/date";
import { initialTasks } from "../data/mockTasks";
import { Header } from "../components/Header";
import { TaskList } from "../components/TaskList";
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
  const [tasks, setTasks] = useState<TasksByCategory>(initialTasks);
  const weekDays = getWeekDays();
  //   console.log("Week Days:", weekDays); // Debugging line
  const { logout } = useAuth();

  const toggleTask = (category: string, taskId: number, dayIndex: number) => {
    // console.log(
    //   `Toggling task ${taskId} in category ${category} for day ${dayIndex}`
    // ); // Debugging line
    const newTasks = { ...tasks };
    const taskToUpdate = newTasks[category].find(
      (task: Task) => task.id === taskId
    );

    if (taskToUpdate) {
      const newHistory = [...taskToUpdate.history];
      newHistory[dayIndex] = !newHistory[dayIndex];
      taskToUpdate.history = newHistory;
      setTasks(newTasks);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
        <div className="flex justify-between items-start">
          <Header />
          <button
            onClick={logout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all mt-4"
          >
            Logout
          </button>
        </div>
        {Object.entries(tasks).map(([category, taskList]) => (
          <TaskList
            key={category}
            category={category}
            tasks={taskList}
            weekDays={weekDays}
            onToggleTask={toggleTask}
          />
        ))}
      </div>
    </div>
  );
};
