import React, { useState } from "react";
import type { ExpenseCategory } from "../../types";
import {
  createCategory,
  createSubCategory,
  updateCategory,
  updateSubCategory,
  deleteCategory,
  deleteSubCategory,
} from "../../services/categoryService";

interface CategoryManagerProps {
  categories: ExpenseCategory[];
  onUpdate: () => void;
  onCategoriesUpdated?: (categories: ExpenseCategory[]) => void;
}

export const CategoryManager = ({
  categories,
  onUpdate,
  onCategoriesUpdated,
}: CategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryNames, setNewSubCategoryNames] = useState<{
    [key: string]: string;
  }>({});
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<{
    categoryId: string;
    subcategoryId: string;
    name: string;
  } | null>(null);
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

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSubmitting(true);
    setError("");
    try {
      await updateCategory(editingCategory.id, { name: editingCategory.name });
      setEditingCategory(null);
      onUpdate();
    } catch (err) {
      setError("Failed to update category. Name might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category and all its subcategories?"
      )
    ) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      onUpdate();
    } catch (err) {
      alert("Failed to delete category. Please try again.");
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

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory) return;
    try {
      await updateSubCategory(
        editingSubCategory.categoryId,
        editingSubCategory.subcategoryId,
        { name: editingSubCategory.name }
      );
      setEditingSubCategory(null);
      onUpdate();
    } catch (err) {
      alert("Failed to update subcategory. Name might already exist.");
    }
  };

  const handleDeleteSubCategory = async (
    categoryId: string,
    subcategoryId: string
  ) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }

    try {
      await deleteSubCategory(categoryId, subcategoryId);
      onUpdate();
    } catch (err) {
      alert("Failed to delete subcategory. Please try again.");
    }
  };

  const handleSubCategoryNameChange = (categoryId: string, name: string) => {
    setNewSubCategoryNames((prev) => ({ ...prev, [categoryId]: name }));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold text-black mb-4">
        Manage Categories
      </h3>

      {/* Create New Category */}
      {!editingCategory && (
        <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-grow p-2 rounded bg-white text-black border border-black"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <form onSubmit={handleUpdateCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            value={editingCategory.name}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, name: e.target.value })
            }
            className="flex-grow p-2 rounded bg-white text-black border border-black"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => setEditingCategory(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="p-3 bg-gray-50 rounded border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-black">{category.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="pl-4 mt-2 space-y-2">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center">
                  {editingSubCategory?.subcategoryId === sub.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editingSubCategory.name}
                        onChange={(e) =>
                          setEditingSubCategory({
                            ...editingSubCategory,
                            name: e.target.value,
                          })
                        }
                        className="flex-1 p-1 rounded text-sm bg-white text-black border border-black"
                      />
                      <button
                        onClick={handleUpdateSubCategory}
                        className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSubCategory(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-black">- {sub.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingSubCategory({
                              categoryId: category.id,
                              subcategoryId: sub.id,
                              name: sub.name,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSubCategory(category.id, sub.id)
                          }
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {category.subcategories.length === 0 && (
                <p className="text-xs text-gray-500">No sub-categories yet.</p>
              )}
            </div>

            {/* Add new subcategory */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="New Sub-category"
                value={newSubCategoryNames[category.id] || ""}
                onChange={(e) =>
                  handleSubCategoryNameChange(category.id, e.target.value)
                }
                className="flex-grow p-1 rounded text-sm bg-white text-black border border-black"
              />
              <button
                onClick={() => handleCreateSubCategory(category.id)}
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded"
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
