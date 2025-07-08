import React from "react";
import type { Account } from "../../types";

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void; // Function to trigger edit mode
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit }) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-black">
          Welcome to the Expense Tracker!
        </h2>
        <p className="text-black mt-2">
          Get started by adding your first financial account below.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-black">Your Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between border border-black"
          >
            <div>
              <p className="text-sm text-black">{account.provider}</p>
              <h3 className="text-lg font-bold text-black truncate">
                {account.accountName}
              </h3>
              <p className="text-2xl font-light text-black-450 mt-2">
                {getCurrencySymbol(account.currency)}
                {account.balance.toFixed(2)}
                {account.accountType === "credit_card" &&
                  account.balance > 0 && (
                    <span className="text-xs text-black ml-2">(debt)</span>
                  )}
              </p>
              {/* Display for Credit Cards */}
              {account.accountType === "credit_card" && (
                <div className="mt-2 text-sm">
                  {account.creditLimit ? (
                    <p className="text-black">
                      Limit: {getCurrencySymbol(account.currency)}
                      {account.creditLimit.toFixed(2)}
                    </p>
                  ) : (
                    <div className="p-2 bg-white/50 rounded-md text-center">
                      <p className="text-black text-xs">
                        Credit limit not set.
                      </p>
                      <button
                        onClick={() => onEdit(account)}
                        className="text-xs text-black underline hover:text-black"
                      >
                        Add Limit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => onEdit(account)}
                className="text-sm bg-black hover:bg-black text-white font-bold py-1 px-3 rounded"
              >
                Edit
              </button>
            </div>
            {account.linkedModes && account.linkedModes.length > 0 && (
              <div className="mt-4 pt-2 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-black mb-1">
                  Linked Modes:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {account.linkedModes.map((mode) => (
                    <span
                      key={mode.name}
                      className="text-xs bg-white text-black px-2 py-1 rounded-full"
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
