import React from "react";
import type { Account } from "../../types";

interface AccountListSidebarProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

export const AccountListSidebar: React.FC<AccountListSidebarProps> = ({
  accounts,
  onEdit,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-6 px-4 bg-gray-800 rounded-lg mb-6">
        <p className="text-gray-400">
          No accounts found. Add your first account below.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3 text-white">Your Accounts</h4>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {account.provider}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      account.accountType === "credit_card"
                        ? "bg-gray-900 text-gray-300"
                        : account.accountType === "bank_account"
                        ? "bg-gray-800 text-gray-200"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {account.accountType.replace("_", " ")}
                  </span>
                </div>
                <h5 className="text-white font-medium truncate mb-2">
                  {account.accountName}
                </h5>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    {getCurrencySymbol(account.currency)}
                    {account.balance.toFixed(2)}
                    {account.accountType === "credit_card" &&
                      account.balance > 0 && (
                        <span className="text-xs text-red-300 ml-2">
                          (debt)
                        </span>
                      )}
                  </span>
                  <button
                    onClick={() => onEdit(account)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Credit card specific info */}
            {account.accountType === "credit_card" && account.creditLimit && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Credit Limit:</span>
                  <span className="text-gray-300">
                    {getCurrencySymbol(account.currency)}
                    {account.creditLimit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-green-300">
                    {getCurrencySymbol(account.currency)}
                    {(account.creditLimit - account.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
