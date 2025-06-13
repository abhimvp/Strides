import React, { useState } from "react";

interface AddTaskFormProps {
  onAddTask: (taskText: string) => void;
  onClose: () => void;
}

export const AddTaskForm = ({ onAddTask, onClose }: AddTaskFormProps) => {
  const [taskText, setTaskText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText.trim());
      setTaskText("");
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="taskText"
          className="block text-sm font-medium text-gray-700"
        >
          Task Name
        </label>
        <input
          type="text"
          id="taskText"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};
