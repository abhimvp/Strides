import React, { useState, useEffect } from "react";
import type {
  Account,
  CreateTransferData,
  CreditCardAnalysis,
  Transaction,
} from "../../types/index";
import { createTransfer } from "../../services/transactionService";
import {
  getCreditCardAnalysis,
  getCreditUtilizationStatus,
  formatCurrency,
  getPaymentUrgencyLevel,
  getPaymentUrgencyStyling,
} from "../../services/creditCardService";
import { format } from "date-fns";

interface TransferFormProps {
  accounts: Account[];
  onSave: () => void;
  onTransferCreated?: (transactions: Transaction[]) => void;
  onCancel?: () => void;
}

export const TransferForm = ({
  accounts,
  onSave,
  onTransferCreated,
  onCancel,
}: TransferFormProps) => {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [commission, setCommission] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [exchangeRateLabel, setExchangeRateLabel] = useState("");

  // Credit Card Payment state
  const [isCreditCardPayment, setIsCreditCardPayment] = useState(false);
  const [creditCardInfo, setCreditCardInfo] = useState<{
    currentDebt: number;
    availableCredit: number;
    remainingAfterPayment: number;
  } | null>(null);
  const [creditCardAnalysis, setCreditCardAnalysis] =
    useState<CreditCardAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Check if transfer is international and detect credit card payments
  useEffect(() => {
    if (fromAccountId && toAccountId) {
      const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
      const toAccount = accounts.find((acc) => acc.id === toAccountId);

      if (fromAccount && toAccount) {
        // Check if this is a credit card payment
        const isCCPayment =
          fromAccount.accountType !== "credit_card" &&
          toAccount.accountType === "credit_card";

        setIsCreditCardPayment(isCCPayment);

        if (isCCPayment) {
          // Calculate basic credit card information
          const currentDebt = toAccount.balance;
          const availableCredit = (toAccount.creditLimit || 0) - currentDebt;
          setCreditCardInfo({
            currentDebt,
            availableCredit,
            remainingAfterPayment: currentDebt, // Will be updated when amount changes
          });

          // Fetch detailed credit card analysis
          setIsLoadingAnalysis(true);
          setAnalysisError(null);
          getCreditCardAnalysis(toAccount.id)
            .then((analysis) => {
              setCreditCardAnalysis(analysis);
            })
            .catch((error) => {
              console.error("Failed to fetch credit card analysis:", error);
              setAnalysisError(
                "Could not load credit card analysis. Please try again."
              );
            })
            .finally(() => {
              setIsLoadingAnalysis(false);
            });
        } else {
          setCreditCardInfo(null);
          setCreditCardAnalysis(null);
        }

        // Check for international transfer
        const isInternationalTransfer =
          fromAccount.country !== toAccount.country;
        setIsInternational(isInternationalTransfer);

        if (isInternationalTransfer) {
          if (fromAccount.country === "US" && toAccount.country === "IN") {
            setExchangeRateLabel("1 USD = ? INR");
          } else if (
            fromAccount.country === "IN" &&
            toAccount.country === "US"
          ) {
            setExchangeRateLabel("1 INR = ? USD");
          }
        } else {
          setExchangeRateLabel("");
          setExchangeRate("");
          setCommission("");
          setServiceName("");
        }
      }
    }
  }, [fromAccountId, toAccountId, accounts]);

  // Update credit card info when amount changes
  useEffect(() => {
    if (isCreditCardPayment && creditCardInfo && amount) {
      const paymentAmount = parseFloat(amount) || 0;
      const newRemainingDebt = creditCardInfo.currentDebt - paymentAmount;

      setCreditCardInfo((prev) =>
        prev
          ? {
              ...prev,
              remainingAfterPayment: newRemainingDebt,
            }
          : null
      );
    }
  }, [amount, isCreditCardPayment, creditCardInfo]);

  const calculateTransferredAmount = () => {
    const amountNum = parseFloat(amount);
    const commissionNum = parseFloat(commission) || 0;
    const exchangeRateNum = parseFloat(exchangeRate) || 1;

    if (isNaN(amountNum)) return 0;

    const afterCommission = amountNum - commissionNum;
    return afterCommission * exchangeRateNum;
  };

  const getAccountCurrency = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return (account?.currency as "INR" | "USD") || "USD";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId || !amount) {
      setError("Please fill in all required fields.");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("Source and destination accounts cannot be the same.");
      return;
    }

    if (isInternational && !exchangeRate) {
      setError("Exchange rate is required for international transfers.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
    const toAccount = accounts.find((acc) => acc.id === toAccountId);

    // Validate based on transfer type
    if (isCreditCardPayment && toAccount) {
      // For credit card payments, allow overpayment but maybe warn the user.
      // The current validation only checks if payment exceeds debt, which is now allowed.
      // We can remove the strict check.
      // if (amountNum > toAccount.balance) {
      //   setError(`Payment amount cannot exceed credit card debt of ${toAccount.currency === "INR" ? "₹" : "$"}${toAccount.balance.toFixed(2)}`);
      //   return;
      // }
    } else if (fromAccount) {
      // For regular transfers, check source account balance
      if (fromAccount.balance < amountNum) {
        setError("Insufficient balance in source account.");
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const transferData: CreateTransferData = {
        fromAccountId,
        toAccountId,
        amount: amountNum,
        notes,
        date,
      };

      if (isInternational) {
        transferData.exchangeRate = parseFloat(exchangeRate);
        if (commission) {
          transferData.commission = parseFloat(commission);
        }
        if (serviceName) {
          transferData.serviceName = serviceName;
        }
      }

      const transferTransactions = await createTransfer(transferData);

      if (onTransferCreated) {
        onTransferCreated(transferTransactions);
      }

      // Reset form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setExchangeRate("");
      setCommission("");
      setServiceName("");
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));

      onSave();
    } catch (err) {
      console.error("Failed to create transfer:", err);
      setError("Failed to create transfer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredToAccounts = accounts.filter((acc) => acc.id !== fromAccountId);
  const transferredAmount = calculateTransferredAmount();

  return (
    <div className="bg-gray-700 p-6 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Transfer Money</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-black text-white p-3 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Account */}
          <div>
            <label className="block text-white mb-2">From Account *</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
              required
            >
              <option value="">Select source account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} ({account.currency}{" "}
                  {account.balance.toFixed(2)}) - {account.country}
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-white mb-2">To Account *</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
              required
            >
              <option value="">Select destination account</option>
              {filteredToAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} ({account.currency}{" "}
                  {account.balance.toFixed(2)}) - {account.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-white mb-2">Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Enhanced Credit Card Payment Info */}
        {isCreditCardPayment && creditCardInfo && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-lg border border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                💳 Credit Card Payment
              </h3>
              {isLoadingAnalysis && (
                <div className="text-purple-200 text-sm animate-pulse">
                  Loading analysis...
                </div>
              )}
            </div>

            {/* Credit Card Analysis Section */}
            {analysisError && (
              <div className="bg-black border border-gray-600 p-3 rounded-lg mb-4 text-white">
                {analysisError}
              </div>
            )}
            {creditCardAnalysis && !analysisError && (
              <div className="mb-6">
                {/* Payment Urgency Alert */}
                {creditCardAnalysis.daysUntilDue !== undefined &&
                  (() => {
                    const urgencyLevel = getPaymentUrgencyLevel(
                      creditCardAnalysis.daysUntilDue,
                      creditCardAnalysis.isOverdue
                    );
                    if (urgencyLevel === "none") return null;

                    const { style, icon } =
                      getPaymentUrgencyStyling(urgencyLevel);

                    return (
                      <div className={`p-3 rounded-lg mb-4 ${style}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <div>
                            <p className="text-white font-medium">
                              {creditCardAnalysis.isOverdue
                                ? "Payment Overdue!"
                                : `Payment Due in ${
                                    creditCardAnalysis.daysUntilDue
                                  } day${
                                    creditCardAnalysis.daysUntilDue !== 1
                                      ? "s"
                                      : ""
                                  }`}
                            </p>
                            {creditCardAnalysis.minimumPaymentDue && (
                              <p className="text-gray-200 text-sm">
                                Minimum due:{" "}
                                {formatCurrency(
                                  creditCardAnalysis.minimumPaymentDue,
                                  getAccountCurrency(toAccountId)
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* Credit Utilization */}
                <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-200 text-sm">
                      Credit Utilization
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        getCreditUtilizationStatus(
                          creditCardAnalysis.creditUtilization
                        ).color
                      }`}
                    >
                      {creditCardAnalysis.creditUtilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        creditCardAnalysis.creditUtilization >= 90
                          ? "bg-black"
                          : creditCardAnalysis.creditUtilization >= 70
                          ? "bg-gray-800"
                          : creditCardAnalysis.creditUtilization >= 30
                          ? "bg-gray-600"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          creditCardAnalysis.creditUtilization,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="bg-black bg-opacity-50 p-3 rounded">
                <p className="text-gray-200 font-medium">Current Debt</p>
                <p className="text-white text-lg font-bold">
                  {formatCurrency(
                    creditCardInfo.currentDebt,
                    getAccountCurrency(toAccountId)
                  )}
                </p>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="bg-gray-800 bg-opacity-50 p-3 rounded">
                  <p className="text-gray-200 font-medium">After Payment</p>
                  <p className="text-white text-lg font-bold">
                    {formatCurrency(
                      creditCardInfo.remainingAfterPayment,
                      getAccountCurrency(toAccountId)
                    )}
                  </p>
                  {creditCardInfo.remainingAfterPayment < 0 && (
                    <p className="text-green-300 text-xs">Credit balance!</p>
                  )}
                </div>
              )}

              <div className="bg-blue-800 bg-opacity-50 p-3 rounded">
                <p className="text-blue-200 font-medium">Available Credit</p>
                <p className="text-white text-lg font-bold">
                  {formatCurrency(
                    creditCardInfo.availableCredit,
                    getAccountCurrency(toAccountId)
                  )}
                </p>
              </div>
            </div>

            {/* Enhanced Payment Options */}
            <div className="space-y-3">
              <p className="text-gray-200 text-sm font-medium">
                Quick Payment Options:
              </p>

              {creditCardAnalysis?.paymentOptions ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {creditCardAnalysis.paymentOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAmount(option.amount.toString())}
                      className={`p-3 rounded text-left transition-colors ${
                        option.type === "minimum"
                          ? "bg-gray-700 hover:bg-gray-600 border border-gray-500"
                          : option.type === "recommended"
                          ? "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                          : "bg-black hover:bg-gray-800 border border-gray-700"
                      }`}
                    >
                      <div className="text-white font-medium text-sm">
                        {option.description}
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(
                          option.amount,
                          getAccountCurrency(toAccountId)
                        )}
                      </div>
                      <div className="text-xs text-gray-200 mt-1">
                        {option.impact}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Fallback to basic buttons if analysis not loaded
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(creditCardInfo.currentDebt.toString())
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Pay Full Balance
                  </button>

                  {creditCardAnalysis?.minimumPaymentDue && (
                    <button
                      type="button"
                      onClick={() =>
                        setAmount(
                          creditCardAnalysis.minimumPaymentDue!.toString()
                        )
                      }
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                    >
                      Pay Minimum Due
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* International Transfer Fields */}
        {isInternational && (
          <div className="bg-gray-900 p-4 rounded">
            <h3 className="text-white font-semibold mb-3">
              International Transfer
            </h3>

            {/* Exchange Rate */}
            <div className="mb-4">
              <label className="block text-white mb-2">
                Exchange Rate * ({exchangeRateLabel})
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                placeholder="Enter exchange rate"
                required
              />
            </div>

            {/* Commission */}
            <div className="mb-4">
              <label className="block text-white mb-2">Commission/Fee</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                placeholder="Enter commission fee"
              />
            </div>

            {/* Service Name */}
            <div className="mb-4">
              <label className="block text-white mb-2">Service Provider</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                placeholder="e.g., Wise, Western Union, Bank Name, Person Name"
              />
            </div>

            {/* Transfer Summary */}
            {amount && exchangeRate && (
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-white font-medium mb-2">
                  Transfer Summary:
                </h4>
                <p className="text-gray-300">Amount to send: {amount}</p>
                {commission && (
                  <p className="text-gray-300">Commission: {commission}</p>
                )}
                <p className="text-gray-300">Exchange rate: {exchangeRate}</p>
                <p className="text-green-400 font-semibold">
                  Amount to receive: {transferredAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-white mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
            placeholder="Optional notes about the transfer"
            rows={3}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-white mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded transition duration-300"
        >
          {isSubmitting ? "Processing Transfer..." : "Transfer Money"}
        </button>
      </form>
    </div>
  );
};
