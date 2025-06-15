import React, { useState, useEffect } from "react";

interface EditFormProps {
  initialValue: string;
  onSave: (newText: string, newCategory?: string) => void;
  onClose: () => void;
  label: string;
  isTask: boolean;
  categories: string[];
  currentCategory: string;
}

export const EditForm = ({
  initialValue,
  onSave,
  onClose,
  label,
  isTask,
  categories,
  currentCategory,
}: EditFormProps) => {
  const [textValue, setTextValue] = useState(initialValue);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  useEffect(() => {
    setTextValue(initialValue);
    setSelectedCategory(currentCategory);
  }, [initialValue, currentCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textValue.trim()) {
      onSave(textValue.trim(), selectedCategory);
      onClose(); // Close modal on save
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="editText"
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
          <input
            type="text"
            id="editText"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>
        {isTask && (
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
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
          Save Changes
        </button>
      </div>
    </form>
  );
};
