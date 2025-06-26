import React, { useState } from "react";
import type { ExpenseCategory } from "../../types";
import {
  createCategory,
  createSubCategory,
} from "../../services/categoryService";

interface CategoryManagerProps {
  categories: ExpenseCategory[];
  onUpdate: () => void;
}

export const CategoryManager = ({
  categories,
  onUpdate,
}: CategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryNames, setNewSubCategoryNames] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await createCategory({ name: newCategoryName });
      setNewCategoryName("");
      onUpdate();
    } catch (err) {
      setError("Failed to create category. It might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubCategory = async (categoryId: string) => {
    const subCategoryName = newSubCategoryNames[categoryId];
    if (!subCategoryName || !subCategoryName.trim()) return;
    try {
      await createSubCategory(categoryId, { name: subCategoryName });
      setNewSubCategoryNames((prev) => ({ ...prev, [categoryId]: "" }));
      onUpdate();
    } catch (err) {
      alert(
        "Failed to add sub-category. It might already exist in this category."
      );
    }
  };

  const handleSubCategoryNameChange = (categoryId: string, name: string) => {
    setNewSubCategoryNames((prev) => ({ ...prev, [categoryId]: name }));
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Manage Categories
      </h3>

      <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="p-3 bg-gray-900 rounded">
            <h4 className="font-bold text-white">{category.name}</h4>
            <div className="pl-4 mt-2 space-y-1">
              {category.subcategories.map((sub) => (
                <p key={sub.id} className="text-sm text-gray-300">
                  - {sub.name}
                </p>
              ))}
              {category.subcategories.length === 0 && (
                <p className="text-xs text-gray-500">No sub-categories yet.</p>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="New Sub-category"
                value={newSubCategoryNames[category.id] || ""}
                onChange={(e) =>
                  handleSubCategoryNameChange(category.id, e.target.value)
                }
                className="flex-grow p-1 rounded text-sm bg-gray-700 text-white border border-gray-600"
              />
              <button
                onClick={() => handleCreateSubCategory(category.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
