// src/components/trips/EditableTripHeader.tsx
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  PencilSimple,
  Check,
  X,
  Plus,
} from "phosphor-react";
import { tripService } from "../../services/tripService";
import type { Trip } from "../../types/trip";

interface EditableTripHeaderProps {
  trip: Trip;
  onBack: () => void;
  onTripUpdated: (updatedTrip: Trip) => void;
}

export const EditableTripHeader = ({
  trip,
  onBack,
  onTripUpdated,
}: EditableTripHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: trip.name,
    destinations: [...trip.destinations],
    start_date: trip.start_date
      ? new Date(trip.start_date).toISOString().slice(0, 16)
      : "",
    end_date: trip.end_date
      ? new Date(trip.end_date).toISOString().slice(0, 16)
      : "",
    status: trip.status,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync form data when trip prop changes
  useEffect(() => {
    setEditData({
      name: trip.name,
      destinations: [...trip.destinations],
      start_date: trip.start_date
        ? new Date(trip.start_date).toISOString().slice(0, 16)
        : "",
      end_date: trip.end_date
        ? new Date(trip.end_date).toISOString().slice(0, 16)
        : "",
      status: trip.status,
    });
  }, [trip]);

  const handleSave = async () => {
    if (!editData.name.trim()) {
      alert("Trip name cannot be empty");
      return;
    }

    const validDestinations = editData.destinations.filter(
      (dest) => dest.trim() !== ""
    );
    if (validDestinations.length === 0) {
      alert("At least one destination is required");
      return;
    }

    setIsLoading(true);
    try {
      console.log("DEBUG: Saving trip with dates:", {
        start_date: editData.start_date,
        end_date: editData.end_date,
      });

      const updatedTrip = await tripService.updateTrip(trip.id, {
        name: editData.name.trim(),
        destinations: validDestinations,
        start_date: editData.start_date || undefined,
        end_date: editData.end_date || undefined,
        status: editData.status,
      });

      console.log("DEBUG: Updated trip received:", updatedTrip);
      onTripUpdated(updatedTrip);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: trip.name,
      destinations: [...trip.destinations],
      start_date: trip.start_date
        ? new Date(trip.start_date).toISOString().slice(0, 16)
        : "",
      end_date: trip.end_date
        ? new Date(trip.end_date).toISOString().slice(0, 16)
        : "",
      status: trip.status,
    });
    setIsEditing(false);
  };

  const addDestination = () => {
    setEditData({
      ...editData,
      destinations: [...editData.destinations, ""],
    });
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...editData.destinations];
    newDestinations[index] = value;
    setEditData({
      ...editData,
      destinations: newDestinations,
    });
  };

  const removeDestination = (index: number) => {
    if (editData.destinations.length > 1) {
      const newDestinations = editData.destinations.filter(
        (_, i) => i !== index
      );
      setEditData({
        ...editData,
        destinations: newDestinations,
      });
    }
  };

  const statusOptions = [
    {
      value: "planning",
      label: "Planning",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    {
      value: "completed",
      label: "Completed",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const currentStatus =
    statusOptions.find((s) => s.value === trip.status) || statusOptions[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Trips</span>
        </button>

        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
            >
              {currentStatus.label}
            </span>
          ) : (
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  status: e.target.value as "planning" | "active" | "completed",
                })
              }
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilSimple size={16} />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check size={16} />
                <span>{isLoading ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip Name */}
      <div className="mb-4">
        {!isEditing ? (
          <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
        ) : (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
            placeholder="Trip name"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destinations */}
        <div className="flex items-start space-x-3">
          <MapPin size={20} className="text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">Destinations</h3>
            {!isEditing ? (
              <p className="text-gray-600">{trip.destinations.join(", ")}</p>
            ) : (
              <div className="space-y-2">
                {editData.destinations.map((destination, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => updateDestination(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Destination ${index + 1}`}
                    />
                    {editData.destinations.length > 1 && (
                      <button
                        onClick={() => removeDestination(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addDestination}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus size={16} />
                  <span>Add Destination</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-start space-x-3">
          <Calendar size={20} className="text-green-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">Trip Dates</h3>
            {!isEditing ? (
              <div className="space-y-1">
                {trip.start_date && (
                  <p className="text-gray-600">
                    Start: {new Date(trip.start_date).toLocaleString()}
                  </p>
                )}
                {trip.end_date && (
                  <p className="text-gray-600">
                    End: {new Date(trip.end_date).toLocaleString()}
                  </p>
                )}
                {!trip.start_date && !trip.end_date && (
                  <p className="text-gray-500 italic">Dates not set</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.start_date}
                    onChange={(e) =>
                      setEditData({ ...editData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.end_date}
                    onChange={(e) =>
                      setEditData({ ...editData, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
