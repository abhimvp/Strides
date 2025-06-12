import React from "react";
import { Plus } from "lucide-react";
import { TaskItem } from "./TaskItem";
import type { Task } from "../types";

interface TaskListProps {
  category: string;
  tasks: Task[];
  weekDays: string[];
  onToggleTask: (category: string, taskId: number, dayIndex: number) => void;
}

export const TaskList = ({
  category,
  tasks,
  weekDays,
  onToggleTask,
}: TaskListProps) => {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-700">{category}</h2>
        <button className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
          <Plus size={16} />
          Add Task
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-[3fr,2fr] gap-4">
          <div className="font-bold text-slate-500 text-sm uppercase tracking-wider">
            Task
          </div>
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-slate-500 text-sm uppercase tracking-wider">
            {weekDays.map((day, i) => (
              <span
                key={i}
                className="w-8 h-8 flex items-center justify-center"
                title={`Day ${i + 1}`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
        <hr className="my-3 border-slate-200" />
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            category={category}
            onToggle={onToggleTask}
          />
        ))}
      </div>
    </section>
  );
};
