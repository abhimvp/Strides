import type { Transaction, Account, ExpenseCategory } from "../../types";
import { format } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: ExpenseCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

export const TransactionList = ({
  transactions,
  accounts,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 px-4 mt-8 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-black">
          No Transactions Yet
        </h3>
        <p className="text-black mt-2">
          Add your first expense or income using the form above to see it here.
        </p>
      </div>
    );
  }

  // Create maps for quick lookups of names from IDs. This is much more efficient.
  const accountMap = new Map(accounts.map((acc) => [acc.id, acc.accountName]));
  const accountCurrencyMap = new Map(
    accounts.map((acc) => [acc.id, acc.currency])
  );
  // Create nested maps for efficient lookups
  const categoryMap = new Map<
    string,
    { name: string; subcategories: Map<string, string> }
  >();
  categories.forEach((cat) => {
    const subMap = new Map(cat.subcategories.map((sub) => [sub.id, sub.name]));
    categoryMap.set(cat.id, { name: cat.name, subcategories: subMap });
  });

  const handleDelete = (tx: Transaction) => {
    onDelete(tx.id);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-black">
        Recent Transactions
      </h2>
      <div className="bg-white rounded-lg shadow-md">
        <ul className="divide-y divide-gray-700">
          {transactions.map((tx) => {
            const isExpense = tx.type === "expense";
            const isTransfer = tx.type === "transfer";
            const currency = accountCurrencyMap.get(tx.accountId) || "INR";
            const currencySymbol = getCurrencySymbol(currency as "INR" | "USD");
            const categoryInfo = categoryMap.get(tx.categoryId);
            const subCategoryName = tx.subCategoryId
              ? categoryInfo?.subcategories.get(tx.subCategoryId)
              : null;

            // Handle display for transfers
            let displayName: string;
            let isTransferOut = false;
            let transferIcon = "";

            if (isTransfer) {
              // Check if this is a credit card payment
              const isCreditCardPayment = tx.isCreditCardPayment === true;

              // Use the new transferDirection field for reliable direction detection
              if (tx.transferDirection === "out") {
                // Money going OUT of this account (negative)
                isTransferOut = true;
                const toAccountName = tx.toAccountId
                  ? accountMap.get(tx.toAccountId)
                  : "Unknown Account";

                if (isCreditCardPayment) {
                  displayName = `Credit Card Payment to ${toAccountName}`;
                  transferIcon = "💳";
                } else {
                  displayName = `Transfer to ${toAccountName}`;
                  transferIcon = "↗";
                }
              } else if (tx.transferDirection === "in") {
                // Money coming INTO this account (positive)
                isTransferOut = false;
                const fromAccountName = tx.toAccountId
                  ? accountMap.get(tx.toAccountId)
                  : "Unknown Account";

                if (isCreditCardPayment) {
                  displayName = `Payment received from ${fromAccountName}`;
                  transferIcon = "💳";
                } else {
                  displayName = `Transfer from ${fromAccountName}`;
                  transferIcon = "↙";
                }
              } else {
                // Fallback for old transfers without transferDirection
                if (tx.notes && tx.notes.includes("Transfer from")) {
                  isTransferOut = false;
                  const fromAccountName = tx.toAccountId
                    ? accountMap.get(tx.toAccountId)
                    : "Unknown Account";
                  displayName = `Transfer from ${fromAccountName}`;
                  transferIcon = "↙";
                } else {
                  isTransferOut = true;
                  const toAccountName = tx.toAccountId
                    ? accountMap.get(tx.toAccountId)
                    : "Unknown Account";
                  displayName = `Transfer to ${toAccountName}`;
                  transferIcon = "↗";
                }
              }
            } else {
              displayName = subCategoryName
                ? `${categoryInfo?.name}: ${subCategoryName}`
                : categoryInfo?.name || "Category";
            }

            return (
              <li
                key={tx.id}
                className="p-4 flex justify-between items-center hover:bg-white/50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        isTransfer
                          ? isTransferOut
                            ? "bg-white/50"
                            : "bg-white/50"
                          : isExpense
                          ? "bg-white/50"
                          : "bg-white/50"
                      }`}
                    >
                      <span
                        className={`text-xl font-bold ${
                          isTransfer
                            ? isTransferOut
                              ? "text-black"
                              : "text-black"
                            : isExpense
                            ? "text-black"
                            : "text-black"
                        }`}
                      >
                        {isTransfer
                          ? transferIcon || (isTransferOut ? "↗" : "↙")
                          : isExpense
                          ? "▼"
                          : "▲"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{displayName}</p>
                    <p className="text-sm text-black">
                      {accountMap.get(tx.accountId) || "Account"}
                    </p>
                    {tx.notes && (
                      <p className="text-xs text-black italic pt-1">
                        "{tx.notes}"
                      </p>
                    )}
                    {/* Show transfer details for international transfers */}
                    {isTransfer &&
                      (tx.exchangeRate || tx.commission || tx.serviceName) && (
                        <div className="text-xs text-black mt-1">
                          {tx.exchangeRate && <p>Rate: {tx.exchangeRate}</p>}
                          {tx.commission && (
                            <p>
                              Fee: {currencySymbol}
                              {tx.commission}
                            </p>
                          )}
                          {tx.serviceName && <p>Via: {tx.serviceName}</p>}
                          {tx.transferredAmount && (
                            <p className="text-black">
                              Received: {tx.transferredAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`font-bold text-lg ${
                      isTransfer
                        ? isTransferOut
                          ? "text-black"
                          : "text-black"
                        : isExpense
                        ? "text-black"
                        : "text-black"
                    }`}
                  >
                    {isTransfer
                      ? isTransferOut
                        ? "-"
                        : "+"
                      : isExpense
                      ? "-"
                      : "+"}
                    {currencySymbol}
                    {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-black">
                    {format(new Date(tx.date), "MMM d, yyyy")}
                  </p>
                  <div className="mt-2 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 justify-end">
                    {!isTransfer && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-xs bg-black hover:bg-black text-white font-bold py-1 px-3 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(tx)}
                      className="text-xs bg-black hover:bg-black text-white font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
