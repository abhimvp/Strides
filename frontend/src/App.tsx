import React, { useState } from "react";
import { initialTasks } from "./data/mockTasks";
import { getWeekDays } from "./utils/date";
import { Header } from "./components/Header";
import { TaskList } from "./components/TaskList";
import type { Task, TasksByCategory } from "./types";

export default function App() {
  const [tasks, setTasks] = useState<TasksByCategory>(initialTasks);
  const weekDays = getWeekDays();

  const toggleTask = (category: string, taskId: number, dayIndex: number) => {
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
        <Header />
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
}
