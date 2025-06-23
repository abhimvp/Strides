import React from "react";
import type { Account } from "../../types";

interface AccountListProps {
  accounts: Account[];
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

const AccountList: React.FC<AccountListProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-800 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-white">
          Welcome to the Expense Tracker!
        </h2>
        <p className="text-gray-400 mt-2">
          Get started by adding your first financial account below.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Your Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-orange-800 p-4 rounded-lg shadow-md flex flex-col justify-between"
          >
            <div>
              <p className="text-sm text-yellow-400">{account.provider}</p>
              <h3 className="text-lg font-bold text-white truncate">
                {account.accountName}
              </h3>
              <p className="text-2xl font-light text-white-450 mt-2">
                {getCurrencySymbol(account.currency)}
                {account.balance.toFixed(2)}
              </p>
            </div>
            {account.linkedModes && account.linkedModes.length > 0 && (
              <div className="mt-4 pt-2 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-gray-300 mb-1">
                  Linked Modes:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {account.linkedModes.map((mode) => (
                    <span
                      key={mode.name}
                      className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full"
                    >
                      {mode.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountList;
