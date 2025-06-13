import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  onAddTask: (category: string, taskText: string) => void;
  onDeleteTask: (category: string, taskId: number) => void;
  onDeleteCategory: (category: string) => void;
}

export const TaskList = ({
  category,
  tasks,
  weekDays,
  weekDates,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onDeleteCategory,
}: TaskListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = (taskText: string) => {
    onAddTask(category, taskText);
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 group">
          <h2 className="text-2xl font-semibold text-slate-700">{category}</h2>

          {/* Action Buttons Container */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteCategory(category)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete category ${category}`}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* Task List Header */}
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
            {/* Placeholder for delete button column */}
            <div className="w-10"></div>
          </div>

          {/* Task Items */}
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={category}
              weekDates={weekDates}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No tasks in this category yet. Add one!
            </p>
          )}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Task to "${category}"`}
      >
        <AddTaskForm
          onAddTask={handleAddTask}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};
