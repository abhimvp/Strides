import { useState, useEffect, useCallback } from "react";
import { ExpenseSidebar } from "../components/expenses/ExpenseSidebar";
import { TransactionList } from "../components/expenses/TransactionList";
import { BalanceSummary } from "../components/expenses/BalanceSummary";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  useOptimisticTransactions,
  useOptimisticAccounts,
  useOptimisticCategories,
} from "../hooks/useOptimisticUpdates";
import { useSelectiveDataFetching } from "../hooks/useSelectiveDataFetching";
import { deleteTransaction } from "../services/transactionService";
import type { Account, ExpenseCategory, Transaction } from "../types";

export const ExpensesViewNew = () => {
  // Data state
  const [initialAccounts, setInitialAccounts] = useState<Account[]>([]);
  const [initialCategories, setInitialCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [initialTransactions, setInitialTransactions] = useState<Transaction[]>(
    []
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimistic update hooks
  const { accounts, updateAccountsList, updateAccountBalance } =
    useOptimisticAccounts(initialAccounts);

  const { categories, updateCategoriesList } =
    useOptimisticCategories(initialCategories);

  const {
    transactions,
    updateTransactionsList,
    optimisticDeleteTransaction,
    rollbackDeleteTransaction,
  } = useOptimisticTransactions(initialTransactions);

  // Selective data fetching
  const {
    isLoading: isRefetching,
    refetchAccounts,
    refetchCategories,
    refetchTransactions,
  } = useSelectiveDataFetching();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<
    "transaction" | "transfer" | "account" | "category"
  >("transaction");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      // Fetch all data in parallel
      const [accountsData, categoriesData, transactionsData] =
        await Promise.all([
          import("../services/accountService").then((m) => m.getAccounts()),
          import("../services/categoryService").then((m) => m.getCategories()),
          import("../services/transactionService").then((m) =>
            m.getTransactions()
          ),
        ]);

      setInitialAccounts(accountsData);
      setInitialCategories(categoriesData);
      setInitialTransactions(transactionsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Could not load your data. Please try refreshing the page.");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Update optimistic state when initial data changes
  useEffect(() => {
    updateAccountsList(initialAccounts);
  }, [initialAccounts, updateAccountsList]);

  useEffect(() => {
    updateCategoriesList(initialCategories);
  }, [initialCategories, updateCategoriesList]);

  useEffect(() => {
    updateTransactionsList(initialTransactions);
  }, [initialTransactions, updateTransactionsList]);

  // Sidebar handlers
  const openSidebar = (
    type: "transaction" | "transfer" | "account" | "category"
  ) => {
    setSidebarType(type);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setEditingTransaction(null);
    setEditingAccount(null);
  };

  // Transaction handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    openSidebar("transaction");
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      setTransactionToDelete(transaction);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    // Optimistically remove the transaction
    optimisticDeleteTransaction(transactionToDelete.id);
    setShowDeleteConfirmation(false);

    try {
      await deleteTransaction(transactionToDelete.id);
      // Update account balance optimistically
      const account = accounts.find(
        (a) => a.id === transactionToDelete.accountId
      );
      if (account) {
        let newBalance = account.balance;
        const isCredit = account.accountType === "credit_card";

        if (transactionToDelete.type === "expense") {
          newBalance = isCredit
            ? newBalance - transactionToDelete.amount
            : newBalance + transactionToDelete.amount;
        } else if (transactionToDelete.type === "income") {
          newBalance = isCredit
            ? newBalance + transactionToDelete.amount
            : newBalance - transactionToDelete.amount;
        }

        updateAccountBalance(account.id, newBalance);
      }

      // Refetch transactions to ensure consistency
      refetchTransactions(updateTransactionsList);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      // Rollback the optimistic update
      rollbackDeleteTransaction(transactionToDelete);
    } finally {
      setTransactionToDelete(null);
    }
  };

  const cancelDeleteTransaction = () => {
    setTransactionToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Account handlers
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    openSidebar("account");
  };

  // Data change handlers
  const handleDataChange = () => {
    // Refetch only the necessary data based on the sidebar type
    switch (sidebarType) {
      case "transaction":
      case "transfer":
        refetchTransactions(updateTransactionsList);
        refetchAccounts(updateAccountsList);
        break;
      case "account":
        refetchAccounts(updateAccountsList);
        break;
      case "category":
        refetchCategories(updateCategoriesList);
        break;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your expenses data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 h-full text-black bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-black text-xl mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full text-black bg-white relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openSidebar("account")}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Manage Accounts
          </button>
          <button
            onClick={() => openSidebar("category")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Manage Categories
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => openSidebar("transfer")}
              className="bg-gray-800 hover:bg-gray-900 text-white p-2.5 rounded-lg shadow-md transition duration-200 flex items-center justify-center"
              title="Transfer Money"
              disabled={accounts.length < 2}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
            <button
              onClick={() => openSidebar("transaction")}
              className="bg-black hover:bg-gray-800 text-white p-2.5 rounded-lg shadow-md transition duration-200 flex items-center justify-center text-lg font-bold"
              title="Add Expense/Income"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator for refetching */}
      {isRefetching && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-30">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Updating...</span>
          </div>
        </div>
      )}

      {/* Balance Summary */}
      <BalanceSummary accounts={accounts} />

      {/* Main Content - Transaction List */}
      <div>
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Sidebar */}
      <ExpenseSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        sidebarType={sidebarType}
        accounts={accounts}
        categories={categories}
        editingTransaction={editingTransaction}
        editingAccount={editingAccount}
        onDataChange={handleDataChange}
        onTransactionCancel={() => setEditingTransaction(null)}
        onAccountCancel={() => setEditingAccount(null)}
        onAccountEdit={handleEditAccount}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && transactionToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          title="Delete Transaction"
          message={`Are you sure you want to delete this ${transactionToDelete.type}? This action cannot be undone.`}
          onConfirm={confirmDeleteTransaction}
          onClose={cancelDeleteTransaction}
        />
      )}
    </div>
  );
};
