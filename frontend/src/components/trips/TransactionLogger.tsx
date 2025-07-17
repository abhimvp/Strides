// src/components/trips/TransactionLogger.tsx
import { useState } from "react";
import {
  Plus,
  CurrencyInr,
  Tag,
  FileText,
  Calendar,
  X,
  Trash,
} from "phosphor-react";
import { tripService, type TransactionData } from "../../services/tripService";
import type { Trip } from "../../types/trip";

interface TransactionLoggerProps {
  trip: Trip;
  onTransactionAdded: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "accommodation", label: "Accommodation", icon: "🏨" },
  { value: "entertainment", label: "Entertainment", icon: "🎉" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "fuel", label: "Fuel", icon: "⛽" },
  { value: "medical", label: "Medical", icon: "🏥" },
  { value: "miscellaneous", label: "Miscellaneous", icon: "📦" },
];

export const TransactionLogger = ({
  trip,
  onTransactionAdded,
}: TransactionLoggerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "leader_expense" | "participant_contribution" | "participant_outofpocket"
  >("leader_expense");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [showNewParticipantForm, setShowNewParticipantForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "food",
    date: new Date().toISOString().split("T")[0], // Today's date
  });
  const [newParticipantData, setNewParticipantData] = useState({
    name: "",
    email: "",
    payment_method: "cash",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Validation for participant-related transactions
    if (
      transactionType === "participant_contribution" ||
      transactionType === "participant_outofpocket"
    ) {
      if (!selectedParticipant && !showNewParticipantForm) {
        alert("Please select a participant or add a new one");
        return;
      }
      if (showNewParticipantForm && !newParticipantData.name) {
        alert("Please enter participant name");
        return;
      }
    }

    setIsLoading(true);
    try {
      const transactionData: TransactionData = {
        type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        paid_by:
          transactionType === "leader_expense"
            ? "leader"
            : selectedParticipant || "new_participant",
      };

      // Add participant data if creating new participant
      if (
        transactionType === "participant_contribution" ||
        transactionType === "participant_outofpocket"
      ) {
        if (showNewParticipantForm) {
          transactionData.participant_data = {
            name: newParticipantData.name,
            email: newParticipantData.email,
            initial_contribution: 0, // Always 0 for new participants created via transactions
            payment_method: newParticipantData.payment_method,
          };
        } else {
          transactionData.participant_id = selectedParticipant;
        }
      }

      console.log("Adding transaction:", transactionData);
      await tripService.addTransaction(trip.id, transactionData);

      // Reset form
      setFormData({
        amount: "",
        description: "",
        category: "food",
        date: new Date().toISOString().split("T")[0],
      });
      setTransactionType("leader_expense");
      setSelectedParticipant("");
      setShowNewParticipantForm(false);
      setNewParticipantData({
        name: "",
        email: "",
        payment_method: "cash",
      });

      setShowAddForm(false);
      onTransactionAdded();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      amount: "",
      description: "",
      category: "food",
      date: new Date().toISOString().split("T")[0],
    });
    setTransactionType("leader_expense");
    setSelectedParticipant("");
    setShowNewParticipantForm(false);
    setNewParticipantData({
      name: "",
      email: "",
      payment_method: "cash",
    });
    setShowAddForm(false);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      console.log("Deleting transaction:", transactionId);
      await tripService.deleteTransaction(trip.id, transactionId);
      onTransactionAdded(); // Refresh the data
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const getCategoryDetails = (categoryValue: string) => {
    return (
      EXPENSE_CATEGORIES.find((cat) => cat.value === categoryValue) ||
      EXPENSE_CATEGORIES[0]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Tag size={20} />
          <span>Transaction Logger</span>
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-4">Log New Expense</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("leader_expense");
                    setSelectedParticipant("");
                    setShowNewParticipantForm(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    transactionType === "leader_expense"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">💸</div>
                    <div className="font-medium">Leader Expense</div>
                    <div className="text-xs text-gray-500">
                      From central budget
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("participant_contribution")}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    transactionType === "participant_contribution"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">💰</div>
                    <div className="font-medium">Contribution</div>
                    <div className="text-xs text-gray-500">Add to budget</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("participant_outofpocket")}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    transactionType === "participant_outofpocket"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">💳</div>
                    <div className="font-medium">Out-of-Pocket</div>
                    <div className="text-xs text-gray-500">
                      Participant pays own
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Participant Selection - Only for participant contributions */}
            {(transactionType === "participant_contribution" ||
              transactionType === "participant_outofpocket") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who paid? *
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => {
                    setSelectedParticipant(e.target.value);
                    setShowNewParticipantForm(e.target.value === "add_new");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select participant</option>
                  {trip.participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                  <option value="add_new">+ Add New Participant</option>
                </select>
              </div>
            )}

            {/* New Participant Form */}
            {showNewParticipantForm && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-3">
                  New Participant Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newParticipantData.name}
                      onChange={(e) =>
                        setNewParticipantData({
                          ...newParticipantData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter participant name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newParticipantData.email}
                      onChange={(e) =>
                        setNewParticipantData({
                          ...newParticipantData,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={newParticipantData.payment_method}
                      onChange={(e) =>
                        setNewParticipantData({
                          ...newParticipantData,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Note:</strong> This person will be added to the
                    trip with ₹0 initial contribution. The expense amount below
                    will be their first contribution.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <CurrencyInr
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter expense description (e.g., Lunch at restaurant, Gas for car)"
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center space-x-2 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  transactionType === "leader_expense"
                    ? "bg-red-600 hover:bg-red-700"
                    : transactionType === "participant_contribution"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>
                      {transactionType === "leader_expense"
                        ? "Add Expense"
                        : transactionType === "participant_contribution"
                        ? "Add Contribution"
                        : "Add Out-of-Pocket"}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h4 className="font-medium text-gray-800 mb-4">Recent Transactions</h4>
        {trip.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No transactions logged yet</p>
            <p className="text-sm">Click "Add Transaction" to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trip.transactions
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 5)
              .map((transaction) => {
                const category = getCategoryDetails(transaction.category);

                // Get participant name for display
                let participantName = "Leader";
                if (
                  transaction.type === "participant_contribution" ||
                  transaction.type === "participant_outofpocket"
                ) {
                  // For participant contributions and out-of-pocket, use participant_id
                  if (transaction.participant_id) {
                    const participant = trip.participants.find(
                      (p) => p.id === transaction.participant_id
                    );
                    participantName =
                      participant?.name || "Unknown Participant";
                  }
                } else if (transaction.type === "leader_expense") {
                  // For leader expenses, check paid_by field
                  if (transaction.paid_by !== "leader") {
                    const participant = trip.participants.find(
                      (p) => p.id === transaction.paid_by
                    );
                    participantName =
                      participant?.name || "Unknown Participant";
                  }
                }

                // Determine display style based on transaction type
                let displayStyle = "";
                let icon = "";
                let description = "";
                let isExpense = false;

                if (transaction.type === "leader_expense") {
                  displayStyle = "bg-red-50 border-red-200";
                  icon = "💸";
                  description = `Leader expense from budget`;
                  isExpense = true;
                } else if (transaction.type === "participant_contribution") {
                  displayStyle = "bg-green-50 border-green-200";
                  icon = "💰";
                  description = `Contribution by ${participantName}`;
                  isExpense = false;
                } else if (transaction.type === "participant_outofpocket") {
                  displayStyle = "bg-blue-50 border-blue-200";
                  icon = "💳";
                  description = `Out-of-pocket by ${participantName} (credited to their contribution)`;
                  isExpense = true; // Shows as expense for display purposes
                }

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${displayStyle}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {category.label} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {icon} {description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            isExpense ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isExpense ? "-" : "+"}₹
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                        title="Delete transaction"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

            {trip.transactions.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-blue-600 text-sm hover:underline">
                  View all {trip.transactions.length} transactions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
