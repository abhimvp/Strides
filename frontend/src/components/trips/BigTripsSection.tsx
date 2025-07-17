// src/components/trips/BigTripsSection.tsx
import { useState, useEffect } from "react";
import { Plus } from "phosphor-react";
import { CreateTripForm } from "./CreateTripForm";
import { TripDetails } from "./TripDetails";
import { tripService } from "../../services/tripService";
import type { Trip } from "../../types/trip";

interface BigTripsSectionProps {
  onTripSelected?: (tripId: string | null) => void;
}

export const BigTripsSection = ({ onTripSelected }: BigTripsSectionProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trips on component mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const tripsData = await tripService.getAllTrips();
      console.log("Loaded trips:", tripsData); // Debug log
      setTrips(tripsData);
    } catch (err) {
      setError("Failed to load trips");
      console.error("Error loading trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData: {
    name: string;
    destinations: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const newTrip = await tripService.createTrip(tripData);
      setTrips([...trips, newTrip]);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating trip:", err);
      alert("Failed to create trip. Please try again.");
    }
  };

  // If a specific trip is selected, show TripDetails
  if (selectedTripId) {
    return (
      <TripDetails
        tripId={selectedTripId}
        onBack={() => {
          setSelectedTripId(null);
          onTripSelected?.(null);
          // Reload trips to ensure the list is updated
          loadTrips();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-gray-500">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadTrips}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <CreateTripForm
        onCancel={() => setShowCreateForm(false)}
        onSubmit={handleCreateTrip}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Big Trips Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage trips with 10+ people and multiple destinations
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      {/* Trips List */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <Plus size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No trips yet</h3>
            <p className="text-sm text-gray-500 mt-2">
              Create your first big trip to get started!
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip, index) => (
            <div
              key={trip.id || `trip-${index}`}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {trip.name}
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Destinations:</span>{" "}
                    {trip.destinations.join(", ")}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        trip.status === "planning"
                          ? "bg-yellow-100 text-yellow-800"
                          : trip.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Participants:</span>{" "}
                    {trip.participants.length}
                  </p>
                  {trip.start_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Starts: {new Date(trip.start_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  const tripId =
                    trip.id || (trip as Trip & { _id?: string })._id;
                  console.log("Selecting trip:", tripId, trip); // Debug log
                  if (tripId) {
                    setSelectedTripId(tripId);
                    onTripSelected?.(tripId);
                  }
                }}
                className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Manage Trip
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
