import React from "react";
import { Bell, Paperclip, CheckCircle, Circle, Trash2 } from "lucide-react";
import type { Task } from "../types";
// This interface defines the props that the TaskItem component will receive.
// It includes the task object, the category it belongs to, and a function to handle toggling the task's completion state.

interface TaskItemProps {
  task: Task;
  category: string;
  onToggle: (category: string, taskId: number, dayIndex: number) => void;
  onDelete: (category: string, taskId: number) => void;
}

export const TaskItem = ({
  task,
  category,
  onToggle,
  onDelete,
}: TaskItemProps) => {
  return (
    <div className="flex justify-between items-center py-3 hover:bg-slate-50 rounded-lg -mx-2 px-2 group">
      {/* Left Side: Task Info */}
      <div className="flex-grow">
        <p className="font-medium">{task.text}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
          {task.frequency && (
            <span className="flex items-center gap-1">
              <Bell size={12} /> {task.frequency}
            </span>
          )}
          {task.prescription && (
            <span className="flex items-center gap-1">
              <Paperclip size={12} /> Attach prescription
            </span>
          )}
          {task.notes && <span className="text-blue-500">{task.notes}</span>}
        </div>
      </div>

      {/* Right Side: Checkmarks and Delete Button */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-7 gap-2 items-center">
          {task.history.map((done, i) => (
            <button
              key={i}
              onClick={() => onToggle(category, task.id, i)}
              className="flex justify-center items-center h-8 w-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              aria-label={`Mark task ${task.text} for day ${i + 1} as ${
                done ? "incomplete" : "complete"
              }`}
            >
              {done ? (
                <CheckCircle className="text-green-500" size={22} />
              ) : (
                <Circle
                  className="text-slate-300 hover:text-slate-400"
                  size={22}
                />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDelete(category, task.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Delete task ${task.text}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
