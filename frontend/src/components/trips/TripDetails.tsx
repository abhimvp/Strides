// src/components/trips/TripDetails.tsx
import { useState, useEffect } from "react";
import { ParticipantManager } from "./ParticipantManager";
import { EditableTripHeader } from "./EditableTripHeader";
import { BudgetOverview } from "./BudgetOverview";
import { TransactionLogger } from "./TransactionLogger";
import { tripService } from "../../services/tripService";
import type { Trip } from "../../types/trip";

interface TripDetailsProps {
  tripId: string;
  onBack: () => void;
}

export const TripDetails = ({ tripId, onBack }: TripDetailsProps) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const tripData = await tripService.getTrip(tripId);
        console.log("DEBUG: Loaded trip data:", tripData);
        console.log("DEBUG: Trip participants:", tripData.participants);
        setTrip(tripData);
      } catch (err) {
        setError("Failed to load trip details");
        console.error("Error loading trip:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId]);

  const handleTripUpdated = (updatedTrip: Trip) => {
    console.log("DEBUG: Trip updated in TripDetails:", updatedTrip);
    setTrip(updatedTrip);
  };

  const handleTripRefresh = () => {
    // Reload the trip data
    const loadTrip = async () => {
      try {
        const tripData = await tripService.getTrip(tripId);
        setTrip(tripData);
      } catch (err) {
        console.error("Error reloading trip:", err);
      }
    };
    loadTrip();
  };

  const handleParticipantAdded = async () => {
    if (trip) {
      // Reload the trip data to ensure consistency
      const updatedTrip = await tripService.getTrip(tripId);
      console.log("DEBUG: Trip after participant addition:", updatedTrip);
      setTrip(updatedTrip);
    }
  };

  const handleParticipantUpdated = async () => {
    if (trip) {
      // Reload the trip data to ensure consistency
      const updatedTrip = await tripService.getTrip(tripId);
      console.log("DEBUG: Trip after participant update:", updatedTrip);
      setTrip(updatedTrip);
    }
  };

  const handleParticipantRemoved = async (participantId: string) => {
    console.log("DEBUG: Removing participant with ID:", participantId);
    if (trip) {
      try {
        await tripService.removeParticipant(tripId, participantId);

        // Reload the trip data to ensure consistency
        const updatedTrip = await tripService.getTrip(tripId);
        console.log("DEBUG: Trip after participant removal:", updatedTrip);
        setTrip(updatedTrip);
      } catch (error) {
        console.error("Error removing participant:", error);
        alert("Failed to remove participant. Please try again.");
      }
    }
  };

  const handleTransactionAdded = async () => {
    if (trip) {
      // Reload the trip data to ensure consistency
      const updatedTrip = await tripService.getTrip(tripId);
      console.log("DEBUG: Trip after transaction addition:", updatedTrip);
      setTrip(updatedTrip);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-gray-500">Loading trip details...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-red-500 mb-4">{error || "Trip not found"}</div>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editable Header */}
      <EditableTripHeader
        trip={trip}
        onBack={onBack}
        onTripUpdated={handleTripUpdated}
      />

      {/* Budget Overview */}
      <BudgetOverview trip={trip} onTripUpdate={handleTripRefresh} />

      {/* Participant Manager */}
      <ParticipantManager
        tripId={tripId}
        participants={trip.participants}
        onParticipantAdded={handleParticipantAdded}
        onParticipantRemoved={handleParticipantRemoved}
        onParticipantUpdated={handleParticipantUpdated}
      />

      {/* Transaction Logger */}
      <TransactionLogger
        trip={trip}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
};
