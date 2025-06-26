import React, { useState } from "react";

interface AddCategoryFormProps {
  onAddCategory: (categoryName: string) => void;
  onClose: () => void;
}

export const AddCategoryForm = ({
  onAddCategory,
  onClose,
}: AddCategoryFormProps) => {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName.trim());
      setCategoryName("");
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="categoryName"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Category Name
        </label>
        <input
          type="text"
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Category
        </button>
      </div>
    </form>
  );
};
