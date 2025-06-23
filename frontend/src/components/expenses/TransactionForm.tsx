import React, { useState, useEffect } from "react";
import type {
  Category,
  SubCategory,
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  Account,
} from "../../types/index";
import {
  createTransaction,
  updateTransaction,
} from "../../services/transactionService";
import { format } from "date-fns";

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  transactionToEdit?: Transaction | null;
  onSave: () => void; // Generic save handler
  onCancelEdit?: () => void;
}

export const TransactionForm = ({
  accounts,
  categories,
  onSave,
  transactionToEdit,
  onCancelEdit,
}: TransactionFormProps) => {
  const isEditMode = !!transactionToEdit;
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    SubCategory[]
  >([]);

  // Effect to populate form when in edit mode
  useEffect(() => {
    if (isEditMode && transactionToEdit) {
      setType(transactionToEdit.type as "expense" | "income");
      setAmount(String(transactionToEdit.amount));
      setAccountId(transactionToEdit.accountId);
      setCategoryId(transactionToEdit.categoryId);
      // Important: Wait for categories to be available before setting sub-category
      const selectedCategory = categories.find(
        (c) => c.id === transactionToEdit.categoryId
      );
      if (selectedCategory) {
        setAvailableSubcategories(selectedCategory.subcategories);
        setSubCategoryId(transactionToEdit.subCategoryId || "");
      }
      setNotes(transactionToEdit.notes || "");
      setDate(format(new Date(transactionToEdit.date), "yyyy-MM-dd"));
    }
  }, [transactionToEdit, isEditMode, categories]);

  // Effect to update subcategories when a main category is selected
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find((c) => c.id === categoryId);
      setAvailableSubcategories(selectedCategory?.subcategories || []);
      setSubCategoryId(""); // Reset subcategory selection
    } else {
      setAvailableSubcategories([]);
    }
  }, [categoryId, categories]);

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategoryId("");
    setSubCategoryId("");
    setNotes("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    if (accounts.length > 0) setAccountId(accounts[0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !categoryId) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const dataPayload: UpdateTransactionData = {
      amount: parseFloat(amount),
      categoryId,
      subCategoryId: subCategoryId || undefined,
      notes: notes || undefined,
      date: new Date(date).toISOString(),
    };

    try {
      if (isEditMode && transactionToEdit) {
        await updateTransaction(transactionToEdit.id, dataPayload);
      } else {
        await createTransaction({ ...dataPayload, type, accountId });
        resetForm();
      }
      onSave();
    } catch (err) {
      setError(`Failed to ${isEditMode ? "update" : "add"} transaction.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {isEditMode ? "Edit Transaction" : "Add New Transaction"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Disable type and account toggle in edit mode */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => !isEditMode && setType("expense")}
            className={`w-full p-2 rounded-md text-sm font-medium ${
              type === "expense" ? "bg-red-600 text-white" : "text-gray-300"
            } ${isEditMode && "cursor-not-allowed opacity-70"}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => !isEditMode && setType("income")}
            className={`w-full p-2 rounded-md text-sm font-medium ${
              type === "income" ? "bg-green-600 text-white" : "text-gray-300"
            } ${isEditMode && "cursor-not-allowed opacity-70"}`}
          >
            Income
          </button>
        </div>

        {/* Add a date picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        />

        {/* Main Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            required
          />
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            required
            disabled={isEditMode}
          >
            <option value="" disabled>
              Select Account
            </option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            disabled={availableSubcategories.length === 0}
          >
            <option value="">Select Sub-category (Optional)</option>
            {availableSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <input
          type="text"
          placeholder="Notes (e.g., 'Chai with friends')"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-4">
          {isEditMode && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Update Transaction"
              : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};
