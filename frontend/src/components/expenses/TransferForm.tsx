import React, { useState, useEffect } from "react";
import type { Account, CreateTransferData } from "../../types/index";
import { createTransfer } from "../../services/transactionService";
import { format } from "date-fns";

interface TransferFormProps {
  accounts: Account[];
  onSave: () => void;
  onCancel?: () => void;
}

export const TransferForm = ({
  accounts,
  onSave,
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
  // Check if transfer is international and update form accordingly
  useEffect(() => {
    if (fromAccountId && toAccountId) {
      const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
      const toAccount = accounts.find((acc) => acc.id === toAccountId);

      if (fromAccount && toAccount) {
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

  const calculateTransferredAmount = () => {
    const amountNum = parseFloat(amount);
    const commissionNum = parseFloat(commission) || 0;
    const exchangeRateNum = parseFloat(exchangeRate) || 1;

    if (isNaN(amountNum)) return 0;

    const afterCommission = amountNum - commissionNum;
    return afterCommission * exchangeRateNum;
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
    if (fromAccount && fromAccount.balance < amountNum) {
      setError("Insufficient balance in source account.");
      return;
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

      await createTransfer(transferData);

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
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
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

        {/* International Transfer Fields */}
        {isInternational && (
          <div className="bg-blue-900 p-4 rounded">
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
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded transition duration-300"
        >
          {isSubmitting ? "Processing Transfer..." : "Transfer Money"}
        </button>
      </form>
    </div>
  );
};
