import type { Account } from "../../types";

interface BalanceSummaryProps {
  accounts: Account[];
}

const getCurrencySymbol = (currency: "INR" | "USD") => {
  return currency === "INR" ? "₹" : "$";
};

const formatAmount = (amount: number, currency: "INR" | "USD") => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Math.abs(amount).toLocaleString()}`;
};

export const BalanceSummary = ({ accounts }: BalanceSummaryProps) => {
  // Calculate balances by country and account type
  const indiaDebitBalance = accounts
    .filter(
      (acc) =>
        acc.country === "IN" &&
        (acc.accountType === "bank_account" ||
          acc.accountType === "e_wallet" ||
          acc.accountType === "cash")
    )
    .reduce((sum, acc) => sum + acc.balance, 0);

  const indiaCreditDebt = accounts
    .filter((acc) => acc.country === "IN" && acc.accountType === "credit_card")
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0); // Taking absolute value since credit card balances are typically negative

  const usaDebitBalance = accounts
    .filter(
      (acc) =>
        acc.country === "US" &&
        (acc.accountType === "bank_account" ||
          acc.accountType === "e_wallet" ||
          acc.accountType === "cash")
    )
    .reduce((sum, acc) => sum + acc.balance, 0);

  const usaCreditDebt = accounts
    .filter((acc) => acc.country === "US" && acc.accountType === "credit_card")
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  // Check if we have any accounts for each category
  const hasIndiaAccounts = accounts.some((acc) => acc.country === "IN");
  const hasUsaAccounts = accounts.some((acc) => acc.country === "US");
  const hasIndiaCreditCards = accounts.some(
    (acc) => acc.country === "IN" && acc.accountType === "credit_card"
  );
  const hasUsaCreditCards = accounts.some(
    (acc) => acc.country === "US" && acc.accountType === "credit_card"
  );

  if (accounts.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <p className="text-gray-300 text-center">
          No accounts found. Add an account to see your balance summary.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Balance Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* India Money I Have */}
        {hasIndiaAccounts && (
          <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-4">
            <p className="text-green-200 text-sm font-semibold">
              Money I Have (India)
            </p>
            <p className="text-white text-3xl font-bold">
              {formatAmount(indiaDebitBalance, "INR")}
            </p>
          </div>
        )}

        {/* India Money to Pay Off */}
        {hasIndiaCreditCards && (
          <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-4">
            <p className="text-red-200 text-sm font-semibold">
              Money to Pay Off (India)
            </p>
            <p className="text-white text-4xl font-bold">
              {formatAmount(indiaCreditDebt, "INR")}
            </p>
            <p className="text-red-400 text-xs">Pay soon!</p>
          </div>
        )}

        {/* USA Money I Have */}
        {hasUsaAccounts && (
          <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-200 text-sm font-semibold">
              Money I Have (USA)
            </p>
            <p className="text-white text-3xl font-bold">
              {formatAmount(usaDebitBalance, "USD")}
            </p>
          </div>
        )}

        {/* USA Money to Pay Off */}
        {hasUsaCreditCards && (
          <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-4">
            <p className="text-red-200 text-sm font-semibold">
              Money to Pay Off (USA)
            </p>
            <p className="text-white text-4xl font-bold">
              {formatAmount(usaCreditDebt, "USD")}
            </p>
            <p className="text-red-400 text-xs">Pay soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};
