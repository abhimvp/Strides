import type { Account } from "../../types";
import {
  calculateCreditUtilization,
  getCreditUtilizationStatus,
} from "../../services/creditCardService";

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

const getAccountTypeIcon = (accountType: string) => {
  switch (accountType) {
    case "credit_card":
      return "💳";
    case "bank_account":
      return "🏦";
    case "e_wallet":
      return "📱";
    case "cash":
      return "💵";
    default:
      return "💰";
  }
};

export const BalanceSummary = ({ accounts }: BalanceSummaryProps) => {
  // Group accounts by country and type
  const indiaAccounts = accounts.filter((acc) => acc.country === "IN");
  const usaAccounts = accounts.filter((acc) => acc.country === "US");

  // Calculate total balances
  const indiaDebitBalance = indiaAccounts
    .filter((acc) => acc.accountType !== "credit_card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const indiaCreditDebt = indiaAccounts
    .filter((acc) => acc.accountType === "credit_card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const usaDebitBalance = usaAccounts
    .filter((acc) => acc.accountType !== "credit_card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const usaCreditDebt = usaAccounts
    .filter((acc) => acc.accountType === "credit_card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 mb-6 border border-black">
        <p className="text-black text-center">
          No accounts found. Add an account to see your balance summary.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-black">
      <h3 className="text-xl font-semibold text-black mb-6">Balance Summary</h3>

      {/* Overall Summary Cards with Account Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* India Summary */}
        {indiaAccounts.length > 0 && (
          <div className="space-y-4">
            {/* India Money I Have */}
            {indiaAccounts.filter((acc) => acc.accountType !== "credit_card")
              .length > 0 && (
              <div className="bg-white bg-opacity-20 border border-black rounded-lg p-4">
                <p className="text-black text-sm font-semibold mb-2">
                  Money I Have (India)
                </p>
                <p className="text-black text-2xl font-bold mb-3">
                  {formatAmount(indiaDebitBalance, "INR")}
                </p>
                <div className="space-y-1">
                  {indiaAccounts
                    .filter((acc) => acc.accountType !== "credit_card")
                    .map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-black flex items-center gap-1">
                          <span className="text-xs">
                            {getAccountTypeIcon(account.accountType)}
                          </span>
                          {account.accountName}
                        </span>
                        <span className="text-black font-medium">
                          {formatAmount(account.balance, account.currency)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* India Money to Pay Off */}
            {indiaAccounts.some((acc) => acc.accountType === "credit_card") && (
              <div className="bg-white bg-opacity-20 border border-black rounded-lg p-4">
                <p className="text-black text-sm font-semibold mb-2">
                  Money to Pay Off (India)
                </p>
                <p className="text-black text-2xl font-bold mb-3">
                  {formatAmount(indiaCreditDebt, "INR")}
                </p>
                <div className="space-y-2">
                  {indiaAccounts
                    .filter((acc) => acc.accountType === "credit_card")
                    .map((account) => {
                      const utilization = account.creditLimit
                        ? calculateCreditUtilization(
                            account.balance,
                            account.creditLimit
                          )
                        : 0;
                      const utilizationStatus =
                        getCreditUtilizationStatus(utilization);
                      return (
                        <div key={account.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-black flex items-center gap-1">
                              <span className="text-xs">💳</span>
                              {account.accountName}
                            </span>
                            <span className="text-black font-medium">
                              {formatAmount(account.balance, account.currency)}
                            </span>
                          </div>
                          {account.creditLimit && (
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-medium ${utilizationStatus.color}`}
                              >
                                {utilization}% utilization
                              </span>
                              <span className="text-black">
                                Limit:{" "}
                                {formatAmount(
                                  account.creditLimit,
                                  account.currency
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                <p className="text-black text-xs mt-2">Pay soon!</p>
              </div>
            )}
          </div>
        )}

        {/* USA Summary */}
        {usaAccounts.length > 0 && (
          <div className="space-y-4">
            {/* USA Money I Have */}
            {usaAccounts.filter((acc) => acc.accountType !== "credit_card")
              .length > 0 && (
              <div className="bg-white bg-opacity-20 border border-black rounded-lg p-4">
                <p className="text-black text-sm font-semibold mb-2">
                  Money I Have (USA)
                </p>
                <p className="text-black text-2xl font-bold mb-3">
                  {formatAmount(usaDebitBalance, "USD")}
                </p>
                <div className="space-y-1">
                  {usaAccounts
                    .filter((acc) => acc.accountType !== "credit_card")
                    .map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-black flex items-center gap-1">
                          <span className="text-xs">
                            {getAccountTypeIcon(account.accountType)}
                          </span>
                          {account.accountName}
                        </span>
                        <span className="text-black font-medium">
                          {formatAmount(account.balance, account.currency)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* USA Money to Pay Off */}
            {usaAccounts.some((acc) => acc.accountType === "credit_card") && (
              <div className="bg-white border border-black rounded-lg p-4">
                <p className="text-black text-sm font-semibold mb-2">
                  Money to Pay Off (USA)
                </p>
                <p className="text-black text-2xl font-bold mb-3">
                  {formatAmount(usaCreditDebt, "USD")}
                </p>
                <div className="space-y-2">
                  {usaAccounts
                    .filter((acc) => acc.accountType === "credit_card")
                    .map((account) => {
                      const utilization = account.creditLimit
                        ? calculateCreditUtilization(
                            account.balance,
                            account.creditLimit
                          )
                        : 0;
                      const utilizationStatus =
                        getCreditUtilizationStatus(utilization);
                      return (
                        <div key={account.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-black flex items-center gap-1">
                              <span className="text-xs">💳</span>
                              {account.accountName}
                            </span>
                            <span className="text-black font-medium">
                              {formatAmount(account.balance, account.currency)}
                            </span>
                          </div>
                          {account.creditLimit && (
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-medium ${utilizationStatus.color}`}
                              >
                                {utilization}% utilization
                              </span>
                              <span className="text-black">
                                Limit:{" "}
                                {formatAmount(
                                  account.creditLimit,
                                  account.currency
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                <p className="text-black text-xs mt-2">Pay soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
