import React from "react";
import {
  Bell,
  Paperclip,
  CheckCircle,
  Circle,
  Trash2,
  Pencil,
  Info,
  GripVertical,
} from "lucide-react";
import type { Task } from "../types";
// This interface defines the props that the TaskItem component will receive.
// It includes the task object, the category it belongs to, and a function to handle toggling the task's completion state.
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: Task;
  categoryName: string;
  weekDates: { fullDate: string; isPast: boolean }[];
  onToggle: (
    categoryName: string,
    taskId: number,
    date: string,
    currentState: boolean
  ) => void;
  onDelete: (categoryName: string, taskId: number) => void;
  onEdit: (categoryName: string, taskId: number, currentText: string) => void;
  isNewUser: boolean;
}

export const TaskItem = ({
  task,
  categoryName,
  weekDates,
  onToggle,
  onDelete,
  onEdit,
  isNewUser,
}: TaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Get the isDragging state from the hook
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      categoryName: categoryName,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Make the item semi-transparent while dragging
  };

  const historyMap = new Map(task.history.map((h) => [h.date, h.completed]));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-between items-center py-3 bg-white rounded-lg -mx-2 px-2 group mb-2 shadow-sm touch-none"
    >
      {/* Drag Handle */}
      <div {...listeners} className="cursor-grab text-slate-400 p-2">
        <GripVertical size={20} />
      </div>
      {/* Left Side: Task Info */}
      <div className="flex-grow pr-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium">{task.text}</p>
          {task.notes && (
            <div className="relative flex items-center group/tooltip">
              <Info size={16} className="text-blue-400 cursor-pointer" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                {task.notes}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
              </div>
            </div>
          )}
          <button
            onClick={() => onEdit(categoryName, task.id, task.text)}
            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Edit task ${task.text}`}
          >
            <Pencil size={16} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
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
        </div>
      </div>

      {/* Right Side: Checkmarks and Delete Button */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-7 gap-2 items-center">
          {weekDates.map(({ fullDate, isPast }) => {
            const isCompleted = historyMap.get(fullDate) || false;
            return (
              <button
                key={fullDate}
                onClick={() =>
                  onToggle(categoryName, task.id, fullDate, isCompleted)
                }
                // THE FIX: Only disable past dates if the user is new.
                disabled={isNewUser && isPast}
                className="flex justify-center items-center h-8 w-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Mark task ${task.text} for date ${fullDate} as ${
                  isCompleted ? "incomplete" : "complete"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="text-green-500" size={22} />
                ) : (
                  <Circle
                    className="text-slate-300 hover:text-slate-400"
                    size={22}
                  />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onDelete(categoryName, task.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Delete task ${task.text}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
