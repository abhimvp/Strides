// src/components/trips/ParticipantManager.tsx
import { useState } from "react";
import {
  Plus,
  User,
  Envelope,
  CurrencyInr,
  X,
  PencilSimple,
  CaretDown,
  CaretUp,
  CreditCard,
} from "phosphor-react";
import type { Participant } from "../../types/trip";

interface ParticipantManagerProps {
  tripId: string;
  participants: Participant[];
  onParticipantAdded: () => void;
  onParticipantRemoved?: (participantId: string) => void;
  onParticipantUpdated?: () => void;
}

export const ParticipantManager = ({
  tripId,
  participants,
  onParticipantAdded,
  onParticipantRemoved,
  onParticipantUpdated,
}: ParticipantManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    initial_contribution: 0,
    payment_method: "cash" as
      | "cash"
      | "phonepe"
      | "googlepay"
      | "bank_transfer"
      | "other",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    initial_contribution: 0,
    payment_method: "cash" as
      | "cash"
      | "phonepe"
      | "googlepay"
      | "bank_transfer"
      | "other",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter participant name");
      return;
    }

    if (formData.initial_contribution < 0) {
      alert("Initial contribution cannot be negative");
      return;
    }

    setIsLoading(true);

    try {
      // Import tripService dynamically to avoid circular imports
      const { tripService } = await import("../../services/tripService");

      const result = await tripService.addParticipant(tripId, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        initial_contribution: formData.initial_contribution,
        payment_method: formData.payment_method,
      });

      console.log("DEBUG: Added participant result:", result);

      onParticipantAdded();

      // Reset form
      setFormData({
        name: "",
        email: "",
        initial_contribution: 0,
        payment_method: "cash",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Failed to add participant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalBudget = () => {
    return participants.reduce((sum, p) => sum + p.initial_contribution, 0);
  };

  const handleEditParticipant = (participant: Participant) => {
    console.log("DEBUG: Editing participant:", participant);
    // Close any existing edit forms first
    setEditingParticipant(null);

    // Then open the new edit form
    setTimeout(() => {
      setEditingParticipant(participant.id);
      setEditFormData({
        name: participant.name,
        email: participant.email || "",
        initial_contribution: participant.initial_contribution,
        payment_method:
          (participant.payment_method as
            | "cash"
            | "phonepe"
            | "googlepay"
            | "bank_transfer"
            | "other") || "cash",
      });
    }, 0);
  };

  const handleUpdateParticipant = async (participantId: string) => {
    if (!editFormData.name.trim()) {
      alert("Please enter participant name");
      return;
    }

    if (editFormData.initial_contribution < 0) {
      alert("Initial contribution cannot be negative");
      return;
    }

    setIsLoading(true);
    try {
      const { tripService } = await import("../../services/tripService");

      const result = await tripService.updateParticipant(
        tripId,
        participantId,
        {
          name: editFormData.name.trim(),
          email: editFormData.email.trim() || undefined,
          initial_contribution: editFormData.initial_contribution,
          payment_method: editFormData.payment_method,
        }
      );

      console.log("DEBUG: Updated participant result:", result);

      onParticipantUpdated?.();
      setEditingParticipant(null);
    } catch (error) {
      console.error("Error updating participant:", error);
      alert("Failed to update participant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingParticipant(null);
    setEditFormData({
      name: "",
      email: "",
      initial_contribution: 0,
      payment_method: "cash",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Trip Participants
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
            >
              {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {participants.length} people • ₹
            {calculateTotalBudget().toLocaleString()} total budget
          </p>
        </div>
        {isExpanded && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Person</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div>
          {/* Add Participant Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-4">
                Add New Participant
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter participant name"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Envelope
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter email"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Contribution
                  </label>
                  <div className="relative">
                    <CurrencyInr
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      value={formData.initial_contribution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          initial_contribution: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      min="0"
                      step="100"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="relative">
                    <CreditCard
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_method: e.target.value as
                            | "cash"
                            | "phonepe"
                            | "googlepay"
                            | "bank_transfer"
                            | "other",
                        })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Participant"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Participants List */}
          <div className="space-y-3">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No participants added yet</p>
                <p className="text-sm">
                  Add people to start building your trip budget
                </p>
              </div>
            ) : (
              participants.map((participant) => {
                console.log("DEBUG: Rendering participant:", participant);
                return (
                  <div
                    key={participant.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {editingParticipant === participant.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Contribution (₹)
                          </label>
                          <input
                            type="number"
                            value={editFormData.initial_contribution}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                initial_contribution: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method
                          </label>
                          <select
                            value={editFormData.payment_method}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                payment_method: e.target.value as
                                  | "cash"
                                  | "phonepe"
                                  | "googlepay"
                                  | "bank_transfer"
                                  | "other",
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="cash">Cash</option>
                            <option value="phonepe">PhonePe</option>
                            <option value="googlepay">Google Pay</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            onClick={() =>
                              handleUpdateParticipant(participant.id)
                            }
                            disabled={isLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {participant.name}
                            </h4>
                            {participant.email && (
                              <p className="text-sm text-gray-500">
                                {participant.email}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Payment:{" "}
                              {participant.payment_method
                                ? participant.payment_method
                                    .charAt(0)
                                    .toUpperCase() +
                                  participant.payment_method
                                    .slice(1)
                                    .replace("_", " ")
                                : "Cash"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              ₹
                              {participant.initial_contribution.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Initial contribution
                            </p>
                          </div>

                          {onParticipantUpdated && (
                            <button
                              onClick={() => handleEditParticipant(participant)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <PencilSimple size={16} />
                            </button>
                          )}

                          {onParticipantRemoved && (
                            <button
                              onClick={() =>
                                onParticipantRemoved(participant.id)
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Budget Summary */}
          {participants.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">
                  Total Trip Budget:
                </span>
                <span className="text-xl font-bold text-blue-900">
                  ₹{calculateTotalBudget().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                From {participants.length} participant
                {participants.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
