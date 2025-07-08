import React, { useState, useEffect } from "react";
import type { TodoItem, CreateTodoData, UpdateTodoData } from "../../types";

interface AddTodoFormProps {
  onSave: (data: CreateTodoData | UpdateTodoData) => void;
  onClose: () => void;
  existingTodo?: TodoItem | null;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({
  onSave,
  onClose,
  existingTodo,
}) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existingTodo) {
      setTitle(existingTodo.title);
      setNotes(existingTodo.notes || "");
    } else {
      setTitle("");
      setNotes("");
    }
  }, [existingTodo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    onSave({ title, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
        >
          {existingTodo ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};
