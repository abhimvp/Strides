import { useState, useEffect, useCallback } from "react";
import { getAccounts } from "../services/accountService";
import { getCategories } from "../services/categoryService";
import AccountList from "../components/expenses/AccountList";
import { AccountForm } from "../components/expenses/AccountForm";
import { TransactionForm } from "../components/expenses/TransactionForm";
import { TransferForm } from "../components/expenses/TransferForm";
import type { Account, ExpenseCategory, Transaction } from "../types";
import { CategoryManager } from "../components/expenses/CategoryManager";
import {
  getTransactions,
  deleteTransaction,
} from "../services/transactionService";
import { TransactionList } from "../components/expenses/TransactionList";
import { Modal } from "../components/Modal";
import { BalanceSummary } from "../components/expenses/BalanceSummary";

export const ExpensesView = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Editing states
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
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

  // Account handlers
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountModal(true);
  };

  const handleSaveAccount = () => {
    setEditingAccount(null);
    setShowAccountModal(false);
    fetchData();
  };

  const handleCancelAccountEdit = () => {
    setEditingAccount(null);
    setShowAccountModal(false);
  };

  // Transaction handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleSaveTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
    fetchData();
  };

  const handleCancelTransactionEdit = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
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

    try {
      await deleteTransaction(transactionToDelete.id);
      fetchData();
    } catch {
      alert("Failed to delete transaction.");
    } finally {
      setTransactionToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDeleteTransaction = () => {
    setTransactionToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Transfer handlers
  const handleSaveTransfer = () => {
    setShowTransferForm(false);
    fetchData();
  };

  const handleCancelTransfer = () => {
    setShowTransferForm(false);
  };

  // Category handlers
  const handleUpdateCategories = () => {
    fetchData(); // This will refetch categories
  };

  // Helper function to get transaction details for confirmation
  const getTransactionDetails = (transaction: Transaction) => {
    const account = accounts.find((acc) => acc.id === transaction.accountId);
    const category = categories.find(
      (cat) => cat.id === transaction.categoryId
    );
    const subCategory = transaction.subCategoryId
      ? category?.subcategories.find(
          (sub) => sub.id === transaction.subCategoryId
        )
      : null;

    const currencySymbol = account?.currency === "INR" ? "₹" : "$";
    const categoryName = subCategory
      ? `${category?.name}: ${subCategory.name}`
      : category?.name || "Category";

    if (transaction.type === "transfer") {
      const toAccount = accounts.find(
        (acc) => acc.id === transaction.toAccountId
      );
      return {
        type: "Transfer",
        amount: `${currencySymbol}${transaction.amount}`,
        description: `Transfer to ${
          toAccount?.accountName || "Unknown Account"
        }`,
        account: account?.accountName || "Unknown Account",
        date: new Date(transaction.date).toLocaleDateString(),
      };
    }

    return {
      type: transaction.type === "expense" ? "Expense" : "Income",
      amount: `${currencySymbol}${transaction.amount}`,
      description: categoryName,
      account: account?.accountName || "Unknown Account",
      date: new Date(transaction.date).toLocaleDateString(),
    };
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800 flex items-center justify-center">
        <p className="text-xl">Loading your expenses data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800 flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full text-white bg-gray-800 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAccountModal(true)}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Manage Accounts
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Manage Categories
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setShowTransferForm(true)}
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
              onClick={() => setShowTransactionForm(true)}
              className="bg-black hover:bg-gray-800 text-white p-2.5 rounded-lg shadow-md transition duration-200 flex items-center justify-center text-lg font-bold"
              title="Add Expense/Income"
            >
              +
            </button>
          </div>
        </div>
      </div>

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

      {/* Account Management Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Manage Accounts"
      >
        <div className="text-gray-800">
          {editingAccount ? (
            <AccountForm
              accountToEdit={editingAccount}
              onSave={handleSaveAccount}
              onCancel={handleCancelAccountEdit}
            />
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">
                  Your Accounts Info
                </h4>
                <AccountList accounts={accounts} onEdit={handleEditAccount} />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Add New Account</h4>
                <AccountForm onSave={handleSaveAccount} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Manage Categories"
      >
        <div className="text-gray-800">
          <CategoryManager
            categories={categories}
            onUpdate={handleUpdateCategories}
          />
        </div>
      </Modal>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        title={editingTransaction ? "Edit Transaction" : "Add Expense/Income"}
      >
        <div className="text-gray-800">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSave={handleSaveTransaction}
            transactionToEdit={editingTransaction}
            onCancelEdit={handleCancelTransactionEdit}
          />
        </div>
      </Modal>

      {/* Transfer Form Modal */}
      <Modal
        isOpen={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        title="Transfer Money"
      >
        <div className="text-gray-800">
          {accounts.length >= 2 ? (
            <TransferForm
              accounts={accounts}
              onSave={handleSaveTransfer}
              onCancel={handleCancelTransfer}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-yellow-600">
                You need at least 2 accounts to make transfers. Please add more
                accounts first.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={cancelDeleteTransaction}
        title="Delete Transaction"
      >
        {transactionToDelete && (
          <div className="text-gray-800">
            <p className="mb-4">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>

            {(() => {
              const details = getTransactionDetails(transactionToDelete);
              return (
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          details.type === "Expense"
                            ? "bg-gray-100 text-gray-800"
                            : details.type === "Income"
                            ? "bg-gray-200 text-gray-900"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        {details.type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Amount:</span>
                      <span className="ml-2 font-bold">{details.amount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Account:
                      </span>
                      <span className="ml-2">{details.account}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="ml-2">{details.date}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">
                        Description:
                      </span>
                      <span className="ml-2">{details.description}</span>
                    </div>
                    {transactionToDelete.notes && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">
                          Notes:
                        </span>
                        <span className="ml-2 italic">
                          {transactionToDelete.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDeleteTransaction}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTransaction}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Delete Transaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
