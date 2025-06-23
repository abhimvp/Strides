import React, { useState, useEffect, useCallback } from "react";
import { getAccounts } from "../services/accountService";
import AccountList from "../components/expenses/AccountList";
import { AccountForm } from "../components/expenses/AccountForm";
import type { Account } from "../types";

export const ExpensesView = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccountManager, setShowAccountManager] = useState(false); // New state for visibility
  const [editingAccount, setEditingAccount] = useState<Account | null>(null); // State for the account being edited

  const fetchAccounts = useCallback(async () => {
    try {
      // Don't set loading to true on refetch, only on initial load
      // setIsLoading(true);
      const userAccounts = await getAccounts();
      setAccounts(userAccounts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError("Could not load your accounts. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowAccountManager(true); // Ensure the manager is visible for editing
  };

  const handleSave = () => {
    setEditingAccount(null); // Exit editing mode
    fetchAccounts(); // Refresh the list
  };

  const handleCancelEdit = () => {
    setEditingAccount(null); // Exit editing mode
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
            </>
          )}
        </div>
      )}

      {/* This section will be for transactions later */}
      <div className="mt-8 p-4 bg-gray-900 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <p className="text-gray-400">
          {accounts.length > 0
            ? "Your transactions will appear here once you add them."
            : "Please add an account above to start tracking transactions."}
        </p>
      </div>
    </div>
  );
};
