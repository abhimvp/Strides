import api from "./api";
import type {
  ExpenseCategory,
  CreateCategoryData,
  CreateSubCategoryData,
} from "../types";

export const getCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get("/categories");
  // Normalize the data to match frontend conventions (_id -> id)
  return response.data.map((category: any) => {
    const { _id, subcategories, ...rest } = category;

    // This part maps the sub-categories
    const mappedSubcategories = subcategories.map((sub: any) => {
      const { _id: subId, ...subRest } = sub;
      return { id: subId, ...subRest };
    });

    // --- THE CRITICAL LINE ---
    // This line ensures the entire corrected category object, with its
    // properly mapped subcategories, is returned from the outer map function.
    return { id: _id, subcategories: mappedSubcategories, ...rest };
  });
};

/**
 * Creates a new main category.
 */
export const createCategory = async (
  categoryData: CreateCategoryData
): Promise<ExpenseCategory> => {
  const response = await api.post("/categories", categoryData);
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};

/**
 * Adds a sub-category to an existing category.
 */
export const createSubCategory = async (
  categoryId: string,
  subCategoryData: CreateSubCategoryData
): Promise<ExpenseCategory> => {
  const response = await api.post(
    `/categories/${categoryId}/subcategories`,
    subCategoryData
  );
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};

/**
 * Updates an existing category.
 */
export const updateCategory = async (
  categoryId: string,
  categoryData: CreateCategoryData
): Promise<ExpenseCategory> => {
  const response = await api.put(`/categories/${categoryId}`, categoryData);
  const { _id, subcategories, ...rest } = response.data;

  const mappedSubcategories = subcategories.map((sub: any) => {
    const { _id: subId, ...subRest } = sub;
    return { id: subId, ...subRest };
  });

  return { id: _id, subcategories: mappedSubcategories, ...rest };
};

/**
 * Updates an existing subcategory.
 */
export const updateSubCategory = async (
  categoryId: string,
  subcategoryId: string,
  subCategoryData: CreateSubCategoryData
): Promise<ExpenseCategory> => {
  const response = await api.put(
    `/categories/${categoryId}/subcategories/${subcategoryId}`,
    subCategoryData
  );
  const { _id, subcategories, ...rest } = response.data;

  const mappedSubcategories = subcategories.map((sub: any) => {
    const { _id: subId, ...subRest } = sub;
    return { id: subId, ...subRest };
  });

  return { id: _id, subcategories: mappedSubcategories, ...rest };
};

/**
 * Deletes a category and all its subcategories.
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  await api.delete(`/categories/${categoryId}`);
};

/**
 * Deletes a specific subcategory from a category.
 */
export const deleteSubCategory = async (
  categoryId: string,
  subcategoryId: string
): Promise<void> => {
  await api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`);
};
