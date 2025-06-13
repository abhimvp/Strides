import React, { useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown } from "lucide-react";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";
import { Modal } from "./Modal";
import { AddTaskForm } from "./AddTaskForm";

interface WeekDay {
  day: string;
  date: number;
  isToday: boolean;
}

interface TaskListProps {
  category: string;
  tasks: Task[];
  weekDays: WeekDay[];
  weekDates: { fullDate: string; isPast: boolean }[];
  onToggleTask: (
    category: string,
    taskId: number,
    date: string,
    currentState: boolean
  ) => void;
  onAddTask: (
    category: string,
    taskData: { text: string; notes?: string }
  ) => void;
  onDeleteTask: (category: string, taskId: number) => void;
  onDeleteCategory: (category: string) => void;
  onEditCategory: (categoryName: string) => void;
  onEditTask: (
    categoryName: string,
    taskId: number,
    currentText: string
  ) => void;
  isOpen: boolean; // Is this category currently open?
  onHeaderClick: () => void; // Function to call when header is clicked
}

export const TaskList = ({
  category,
  tasks,
  weekDays,
  weekDates,
  isOpen,
  onHeaderClick,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onDeleteCategory,
  onEditCategory,
  onEditTask,
}: TaskListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="mb-2 group">
        {/* THE FIX: The outer element is now a div, but it acts like a button */}
        <div
          onClick={onHeaderClick}
          className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onHeaderClick();
          }}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            <ChevronDown
              size={24}
              className={`text-slate-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
            <h2 className="text-2xl font-semibold text-slate-700">
              {category}
            </h2>
          </div>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* These buttons are no longer nested, making the HTML valid */}
            <button
              onClick={() => onEditCategory(category)}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Edit category ${category}`}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDeleteCategory(category)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete category ${category}`}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* This content will now correctly show/hide */}
        {isOpen && (
          <div className="bg-white rounded-xl shadow-lg p-4 mt-2">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <div className="font-bold text-slate-500 text-sm uppercase tracking-wider flex-grow">
                Task
              </div>
              <div className="grid grid-cols-7 gap-2 text-center font-bold text-slate-500 text-sm uppercase tracking-wider">
                {weekDays.map(({ day, date, isToday }) => (
                  <div
                    key={day}
                    className={`w-8 h-10 flex flex-col items-center justify-center rounded-md ${
                      isToday ? "bg-blue-100 text-blue-600" : ""
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-xs">{date}</span>
                  </div>
                ))}
              </div>
              <div className="w-10"></div>
            </div>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                categoryName={category}
                weekDates={weekDates}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No tasks in this category yet. Add one!
              </p>
            )}
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Task to "${category}"`}
      >
        <AddTaskForm
          onAddTask={(taskData) => onAddTask(category, taskData)}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};
