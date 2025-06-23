import React, { useState, useEffect, useCallback } from "react";
import { getAccounts } from "../services/accountService";
import AccountList from "../components/expenses/AccountList";
import {AddAccountForm} from "../components/expenses/AddAccountForm";
import type { Account } from "../types";

export const ExpensesView = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      {isLoading && <p>Loading accounts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <AccountList accounts={accounts} />
          <AddAccountForm onAccountAdded={fetchAccounts} />
        </>
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
