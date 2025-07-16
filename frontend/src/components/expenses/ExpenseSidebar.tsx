import { useState } from "react";
import type { Account, ExpenseCategory, Transaction } from "../../types";
import { TransactionForm } from "./TransactionForm";
import { TransferForm } from "./TransferForm";
import { AccountForm } from "./AccountForm";
import { AccountListSidebar } from "./AccountListSidebar";
import { CategoryManager } from "./CategoryManager";

interface ExpenseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarType: "transaction" | "transfer" | "account" | "category";
  accounts: Account[];
  categories: ExpenseCategory[];
  editingTransaction?: Transaction | null;
  editingAccount?: Account | null;
  onDataChange: () => void; // Simplified callback for data changes
  onTransactionCancel?: () => void;
  onAccountCancel?: () => void;
  onAccountEdit?: (account: Account) => void; // Add account edit callback
}

export const ExpenseSidebar = ({
  isOpen,
  onClose,
  sidebarType,
  accounts,
  categories,
  editingTransaction,
  editingAccount,
  onDataChange,
  onTransactionCancel,
  onAccountCancel,
  onAccountEdit,
}: ExpenseSidebarProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300);
  };

  const getSidebarTitle = () => {
    switch (sidebarType) {
      case "transaction":
        return editingTransaction ? "Edit Transaction" : "Add Expense/Income";
      case "transfer":
        return "Transfer Money";
      case "account":
        return editingAccount ? "Edit Account" : "Manage Accounts";
      case "category":
        return "Manage Categories";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isAnimating ? "opacity-0" : "opacity-30"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isAnimating ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-black">
          <h2 className="text-xl font-semibold text-black">
            {getSidebarTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="text-black hover:text-black transition-colors p-2 rounded-full hover:bg-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full pb-24">
          {sidebarType === "transaction" && (
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onSave={() => {
                onDataChange();
                handleClose();
              }}
              transactionToEdit={editingTransaction}
              onCancelEdit={onTransactionCancel}
            />
          )}

          {sidebarType === "transfer" && (
            <TransferForm
              accounts={accounts}
              onSave={() => {
                onDataChange();
                handleClose();
              }}
              onCancel={handleClose}
            />
          )}

          {sidebarType === "account" && (
            <div className="space-y-6">
              {editingAccount ? (
                <AccountForm
                  accountToEdit={editingAccount}
                  onSave={() => {
                    onDataChange();
                    handleClose();
                  }}
                  onCancel={onAccountCancel}
                />
              ) : (
                <>
                  <AccountListSidebar
                    accounts={accounts}
                    onEdit={onAccountEdit || (() => {})}
                    onAccountDeleted={() => {
                      onDataChange();
                    }}
                  />
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-black">
                      Add New Account
                    </h4>
                    <AccountForm
                      onSave={() => {
                        onDataChange();
                        handleClose();
                      }}
                      onCancel={onAccountCancel}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {sidebarType === "category" && (
            <CategoryManager
              categories={categories}
              onUpdate={() => {
                onDataChange();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};
