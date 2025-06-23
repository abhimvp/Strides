import React, { useState, useEffect, useCallback } from "react";
import { getAccounts } from "../services/accountService";
import { getCategories } from "../services/categoryService"; // Import category service
import AccountList from "../components/expenses/AccountList";
import { AccountForm } from "../components/expenses/AccountForm";
import { TransactionForm } from "../components/expenses/TransactionForm"; // Import transaction form
import type { Account, Category, Transaction } from "../types";
import { CategoryManager } from "../components/expenses/CategoryManager"; // Import the new component
import {
  getTransactions,
  deleteTransaction,
} from "../services/transactionService"; // Import transaction service
import { TransactionList } from "../components/expenses/TransactionList"; // Import transaction list

export const ExpensesView = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccountManager, setShowAccountManager] = useState(false); // New state for visibility
  const [editingAccount, setEditingAccount] = useState<Account | null>(null); // State for the account being edited
  const [categories, setCategories] = useState<Category[]>([]); // State for categories
  const [transactions, setTransactions] = useState<Transaction[]>([]); // State for transactions
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null); // State for editing a transaction

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all data in parallel for better performance
      const [userAccounts, userCategories, userTransactions] =
        await Promise.all([getAccounts(), getCategories(), getTransactions()]);
      setAccounts(userAccounts);
      setCategories(userCategories);
      setTransactions(userTransactions);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load your data. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowAccountManager(true); // Ensure the manager is visible for editing
  };

  const handleSave = () => {
    setEditingAccount(null); // Exit editing mode
    fetchData(); // Refresh the list
  };

  const handleCancelEdit = () => {
    setEditingAccount(null); // Exit editing mode
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top to see the form
  };

  const handleCancelEditTransaction = () => {
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      fetchData(); // Refresh data after delete
    } catch (error) {
      alert("Failed to delete transaction.");
    }
  };

  const handleSaveTransaction = () => {
    setEditingTransaction(null); // Exit edit mode
    fetchData(); // Refresh all data
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <button
          onClick={() => setShowAccountManager(!showAccountManager)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {showAccountManager ? "Hide Accounts" : "Manage Accounts"}
        </button>
      </div>

      {isLoading && <p>Loading accounts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Conditionally render the account management section */}
      {showAccountManager && !isLoading && !error && (
        <div className="mb-8">
          {/* If we are editing, show only the form. Otherwise, show the list and the add form. */}
          {editingAccount ? (
            <AccountForm
              accountToEdit={editingAccount}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
              <AccountList accounts={accounts} onEdit={handleEdit} />
              <AccountForm onSave={handleSave} />
              {/* Add the Category Manager here */}
              <CategoryManager categories={categories} onUpdate={fetchData} />
            </>
          )}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-8">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSave={handleSaveTransaction}
            transactionToEdit={editingTransaction}
            onCancelEdit={handleCancelEditTransaction}
          />
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
      )}
    </div>
  );
};
