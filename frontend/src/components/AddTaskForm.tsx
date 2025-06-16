// src/components/AddTaskForm.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";

interface AddTaskFormProps {
  onAddTask: (
    taskData: { text: string; notes?: string },
    categoryName: string
  ) => void;
  onClose: () => void;
  categories?: string[];
  defaultCategory?: string;
}

export const AddTaskForm = ({
  onAddTask,
  onClose,
  categories,
  defaultCategory = "",
}: AddTaskFormProps) => {
  const [taskText, setTaskText] = useState("");
  const [notes, setNotes] = useState("");

  // THE FIX: The initial state for the dropdown is now more robust.
  // It defaults to the provided defaultCategory if it exists, otherwise it's empty.
  const [selectedCategory, setSelectedCategory] = useState(
    categories ? defaultCategory || "" : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // THE FIX: The logic to determine the category is now simplified and correct.
    // If a dropdown is present, we use its state. If not, we trust the defaultCategory passed in.
    const categoryToUse = categories ? selectedCategory : defaultCategory;

    if (taskText.trim() && categoryToUse) {
      onAddTask({ text: taskText.trim(), notes: notes.trim() }, categoryToUse);
      setTaskText("");
      setNotes("");
      onClose();
    } else if (categories && !selectedCategory) {
      // This alert now only triggers for the global add task modal if no category is chosen.
      toast.error("Please select a category.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
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
            required
            autoFocus
          />
        </div>

        {/* The conditional rendering for the dropdown remains the same */}
        {categories && (
          <div>
            <label
              htmlFor="categorySelect"
              className="block text-sm font-medium text-gray-700"
            >
              Add to Category
            </label>
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Select a category...
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a short description or reference..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
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
