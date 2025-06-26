import type { Transaction, Account, Category } from "../../types";
import { format } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
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
      <div className="text-center py-10 px-4 mt-8 bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-white">
          No Transactions Yet
        </h3>
        <p className="text-gray-400 mt-2">
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
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Recent Transactions
      </h2>
      <div className="bg-gray-800 rounded-lg shadow-md">
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
            if (isTransfer) {
              const toAccountName = tx.toAccountId
                ? accountMap.get(tx.toAccountId)
                : "Unknown Account";
              displayName = `Transfer to ${toAccountName}`;
            } else {
              displayName = subCategoryName
                ? `${categoryInfo?.name}: ${subCategoryName}`
                : categoryInfo?.name || "Category";
            }

            return (
              <li
                key={tx.id}
                className="p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        isTransfer
                          ? "bg-blue-900/50"
                          : isExpense
                          ? "bg-red-900/50"
                          : "bg-green-900/50"
                      }`}
                    >
                      <span
                        className={`text-xl font-bold ${
                          isTransfer
                            ? "text-blue-400"
                            : isExpense
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {isTransfer ? "↔" : isExpense ? "▼" : "▲"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{displayName}</p>
                    <p className="text-sm text-gray-400">
                      {accountMap.get(tx.accountId) || "Account"}
                    </p>
                    {tx.notes && (
                      <p className="text-xs text-gray-500 italic pt-1">
                        "{tx.notes}"
                      </p>
                    )}
                    {/* Show transfer details for international transfers */}
                    {isTransfer &&
                      (tx.exchangeRate || tx.commission || tx.serviceName) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {tx.exchangeRate && <p>Rate: {tx.exchangeRate}</p>}
                          {tx.commission && (
                            <p>
                              Fee: {currencySymbol}
                              {tx.commission}
                            </p>
                          )}
                          {tx.serviceName && <p>Via: {tx.serviceName}</p>}
                          {tx.transferredAmount && (
                            <p className="text-green-400">
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
                        ? "text-blue-400"
                        : isExpense
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {isTransfer ? "" : isExpense ? "-" : "+"}
                    {currencySymbol}
                    {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(tx.date), "MMM d, yyyy")}
                  </p>
                  <div className="mt-2 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 justify-end">
                    {!isTransfer && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(tx)}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
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
