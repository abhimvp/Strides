import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";
import { Modal } from "./Modal";
import { AddTaskForm } from "./AddTaskForm";

interface TaskListProps {
  category: string;
  tasks: Task[];
  weekDays: string[];
  onToggleTask: (category: string, taskId: number, dayIndex: number) => void;
  onAddTask: (category: string, taskText: string) => void;
}

export const TaskList = ({
  category,
  tasks,
  weekDays,
  onToggleTask,
  onAddTask,
}: TaskListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = (taskText: string) => {
    onAddTask(category, taskText);
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-700">{category}</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
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
