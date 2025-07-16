import React, { useState } from "react";
import type { Account } from "../../types";
import { deleteAccount } from "../../services/accountService";
import { ConfirmationDialog } from "../ConfirmationDialog";

interface AccountListSidebarProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onAccountDeleted?: () => void;
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

export const AccountListSidebar: React.FC<AccountListSidebarProps> = ({
  accounts,
  onEdit,
  onAccountDeleted,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccount(accountToDelete.id);
      onAccountDeleted?.();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setAccountToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setAccountToDelete(null);
  };
  if (accounts.length === 0) {
    return (
      <div className="text-center py-6 px-4 bg-white rounded-lg mb-6">
        <p className="text-black">
          No accounts found. Add your first account below.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3 text-black">Your Accounts</h4>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white p-4 rounded-lg border border-gray-700 hover:border-black transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-white text-black px-2 py-1 rounded">
                    {account.provider}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      account.accountType === "credit_card"
                        ? "bg-white text-black"
                        : account.accountType === "bank_account"
                        ? "bg-white text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    {account.accountType.replace("_", " ")}
                  </span>
                </div>
                <h5 className="text-black font-medium truncate mb-2">
                  {account.accountName}
                </h5>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-black">
                    {getCurrencySymbol(account.currency)}
                    {account.balance.toFixed(2)}
                    {account.accountType === "credit_card" &&
                      account.balance > 0 && (
                        <span className="text-xs text-black ml-2">(debt)</span>
                      )}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(account)}
                      className="text-black hover:text-gray-600 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(account)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit card specific info */}
            {account.accountType === "credit_card" && account.creditLimit && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Credit Limit:</span>
                  <span className="text-black">
                    {getCurrencySymbol(account.currency)}
                    {account.creditLimit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-black">Available:</span>
                  <span className="text-black">
                    {getCurrencySymbol(account.currency)}
                    {(account.creditLimit - account.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && accountToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete Account"
          message={`Are you sure you want to delete "${accountToDelete.accountName}"? This action cannot be undone and will remove all associated transactions.`}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
        />
      )}
    </div>
  );
};
