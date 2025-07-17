// src/components/trips/BudgetOverview.tsx
import { CurrencyInr, TrendUp, TrendDown, Wallet } from "phosphor-react";
import type { Trip } from "../../types/trip";
import { useState } from "react";

interface BudgetOverviewProps {
  trip: Trip;
  onTripUpdate?: () => void;
}

export const BudgetOverview = ({ trip, onTripUpdate }: BudgetOverviewProps) => {
  const [isFixingData, setIsFixingData] = useState(false);

  const handleFixDataConsistency = async () => {
    setIsFixingData(true);
    try {
      const response = await fetch(
        `/api/trips/${trip.id}/fix-data-consistency`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Data consistency fix completed. ${result.updates_applied} corrections applied.`
        );
        if (onTripUpdate) onTripUpdate();
      } else {
        alert("Failed to fix data consistency");
      }
    } catch (error) {
      console.error("Error fixing data consistency:", error);
      alert("Error fixing data consistency");
    } finally {
      setIsFixingData(false);
    }
  };
  // Calculate direct contributions to central budget (initial + additional contributions)
  const directContributions =
    trip.participants.reduce(
      (sum, participant) => sum + participant.initial_contribution,
      0
    ) +
    trip.transactions
      .filter((transaction) => transaction.type === "participant_contribution")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate total expenses from central budget (only leader expenses)
  const centralBudgetExpenses = trip.transactions
    .filter((transaction) => transaction.type === "leader_expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate remaining central budget balance
  const remainingBalance = directContributions - centralBudgetExpenses;

  // Calculate progress percentage (central budget usage)
  const progressPercentage =
    directContributions > 0
      ? Math.min((centralBudgetExpenses / directContributions) * 100, 100)
      : 0;

  // Determine color based on remaining balance
  const getBalanceColor = () => {
    if (remainingBalance > 0) return "text-green-600";
    if (remainingBalance === 0) return "text-gray-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (progressPercentage < 70) return "bg-green-500";
    if (progressPercentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Wallet size={20} />
          <span>Budget Overview</span>
        </h3>
        <div className={`text-sm font-medium ${getBalanceColor()}`}>
          Balance: ₹{remainingBalance.toLocaleString()}
        </div>
      </div>

      {/* Budget Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Contributions */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">
                Total Contributions
              </p>
              <p className="text-2xl font-bold text-blue-900 flex items-center">
                <CurrencyInr size={20} />
                {directContributions.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendUp size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            From {trip.participants.length} participant
            {trip.participants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">
                Central Budget Used
              </p>
              <p className="text-2xl font-bold text-red-900 flex items-center">
                <CurrencyInr size={20} />
                {centralBudgetExpenses.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendDown size={24} className="text-red-600" />
            </div>
          </div>
          <p className="text-red-600 text-sm mt-1">
            {
              trip.transactions.filter((t) => t.type === "leader_expense")
                .length
            }{" "}
            leader expense
            {trip.transactions.filter((t) => t.type === "leader_expense")
              .length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* Remaining Balance */}
        <div
          className={`${
            remainingBalance >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-lg p-4 border`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  remainingBalance >= 0 ? "text-green-700" : "text-red-700"
                } text-sm font-medium`}
              >
                Central Budget Balance
              </p>
              <p
                className={`text-2xl font-bold ${
                  remainingBalance >= 0 ? "text-green-900" : "text-red-900"
                } flex items-center`}
              >
                <CurrencyInr size={20} />
                {Math.abs(remainingBalance).toLocaleString()}
              </p>
            </div>
            <div
              className={`${
                remainingBalance >= 0 ? "bg-green-100" : "bg-red-100"
              } p-3 rounded-full`}
            >
              <Wallet
                size={24}
                className={
                  remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                }
              />
            </div>
          </div>
          <p
            className={`${
              remainingBalance >= 0 ? "text-green-600" : "text-red-600"
            } text-sm mt-1`}
          >
            {remainingBalance >= 0
              ? "Available in central fund"
              : "Over budget"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Central Budget Usage</span>
          <span>{progressPercentage.toFixed(1)}% used</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Participant Settlement Summary */}
      {trip.participants.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-3 flex items-center">
            🧾 Settlement Summary
          </h4>
          <div className="space-y-2">
            {trip.participants.map((participant) => {
              // Safeguard against negative values - this shouldn't happen but protects UI
              const safeContribution = Math.max(
                0,
                participant.total_contributed || 0
              );
              const safeInitial = Math.max(
                0,
                participant.initial_contribution || 0
              );

              return (
                <div
                  key={participant.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium text-purple-700">
                    {participant.name}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-purple-900">
                      ₹{safeContribution.toLocaleString()}
                    </span>
                    <span className="text-xs text-purple-600 ml-2">
                      (Initial: ₹{safeInitial.toLocaleString()})
                    </span>
                    {participant.total_contributed < 0 && (
                      <div className="text-xs text-red-600 ml-2">
                        ⚠️ Data inconsistency: {participant.total_contributed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-600">
              Total contributions include initial contributions and
              out-of-pocket expenses. Final settlement will calculate fair share
              based on total trip costs.
            </p>
            {/* Debug info - temporary */}
            <div className="mt-2 text-xs text-gray-500">
              <details>
                <summary>Debug: Transaction Summary</summary>
                <div className="mt-2 space-y-1">
                  <div>Total Transactions: {trip.transactions.length}</div>
                  <div>
                    Participant Contributions:{" "}
                    {
                      trip.transactions.filter(
                        (t) => t.type === "participant_contribution"
                      ).length
                    }
                  </div>
                  <div>
                    Out-of-Pocket Expenses:{" "}
                    {
                      trip.transactions.filter(
                        (t) => t.type === "participant_outofpocket"
                      ).length
                    }
                  </div>
                  <div>
                    Leader Expenses:{" "}
                    {
                      trip.transactions.filter(
                        (t) => t.type === "leader_expense"
                      ).length
                    }
                  </div>
                  <button
                    onClick={handleFixDataConsistency}
                    disabled={isFixingData}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isFixingData ? "Fixing..." : "Fix Data Consistency"}
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Participant Out-of-Pocket Expenses */}
      {trip.transactions.filter((t) => t.type === "participant_outofpocket")
        .length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            💳 Participant Out-of-Pocket Expenses
          </h4>
          <p className="text-sm text-blue-600 mb-2">
            These expenses are paid by participants separately and will be
            considered during final settlement.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Total Out-of-Pocket</p>
              <p className="font-semibold text-blue-900">
                ₹
                {trip.transactions
                  .filter((t) => t.type === "participant_outofpocket")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Transactions</p>
              <p className="font-semibold text-blue-900">
                {
                  trip.transactions.filter(
                    (t) => t.type === "participant_outofpocket"
                  ).length
                }{" "}
                expense
                {trip.transactions.filter(
                  (t) => t.type === "participant_outofpocket"
                ).length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="text-sm">
          <p className="text-gray-500">Per Person</p>
          <p className="font-semibold text-gray-800">
            ₹
            {trip.participants.length > 0
              ? (
                  directContributions / trip.participants.length
                ).toLocaleString()
              : 0}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Avg. Leader Expense</p>
          <p className="font-semibold text-gray-800">
            ₹
            {trip.transactions.filter((t) => t.type === "leader_expense")
              .length > 0
              ? (
                  centralBudgetExpenses /
                  trip.transactions.filter((t) => t.type === "leader_expense")
                    .length
                ).toLocaleString()
              : 0}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Days Active</p>
          <p className="font-semibold text-gray-800">
            {trip.start_date && trip.end_date
              ? Math.ceil(
                  (new Date(trip.end_date).getTime() -
                    new Date(trip.start_date).getTime()) /
                    (1000 * 3600 * 24)
                )
              : "N/A"}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Status</p>
          <p className="font-semibold text-gray-800 capitalize">
            {trip.status}
          </p>
        </div>
      </div>
    </div>
  );
};
