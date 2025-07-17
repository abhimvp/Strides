// src/components/trips/CreateTripForm.tsx
import { useState } from "react";
import { Plus, X, MapPin, Calendar } from "phosphor-react";

interface CreateTripFormProps {
  onCancel: () => void;
  onSubmit: (tripData: {
    name: string;
    destinations: string[];
    start_date?: string;
    end_date?: string;
  }) => void;
}

export const CreateTripForm = ({ onCancel, onSubmit }: CreateTripFormProps) => {
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<string[]>([""]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const addDestination = () => {
    setDestinations([...destinations, ""]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, value: string) => {
    const updated = [...destinations];
    updated[index] = value;
    setDestinations(updated);
  };

  const handleSubmit = () => {
    const validDestinations = destinations.filter((dest) => dest.trim() !== "");

    if (tripName.trim() === "" || validDestinations.length === 0) {
      alert("Please enter trip name and at least one destination");
      return;
    }

    onSubmit({
      name: tripName.trim(),
      destinations: validDestinations,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Create New Big Trip
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Trip Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Name *
          </label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g., Goa Beach Trip 2025"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Destinations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinations *
          </label>
          <div className="space-y-3">
            {destinations.map((destination, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    placeholder={`Destination ${index + 1}`}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {destinations.length > 1 && (
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
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Another Destination</span>
            </button>
          </div>
        </div>

        {/* Optional Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date (Optional)
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Trip
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
