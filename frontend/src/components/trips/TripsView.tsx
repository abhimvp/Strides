// src/components/trips/TripsView.tsx
import { useState } from "react";
import type { TripType } from "../../types/trip";
import { TripTypeSelector } from "./TripTypeSelector";
import { BigTripsSection } from "./BigTripsSection";

export const TripsView = () => {
  const [selectedTripType, setSelectedTripType] =
    useState<TripType>("big-trips");
  const [isInDetailView, setIsInDetailView] = useState(false);

  return (
    <div className="space-y-6">
      {/* Only show trip type selector when not in detail view */}
      {!isInDetailView && (
        <TripTypeSelector
          selectedType={selectedTripType}
          onTypeChange={setSelectedTripType}
        />
      )}

      {selectedTripType === "big-trips" && (
        <BigTripsSection
          onTripSelected={(tripId) => setIsInDetailView(tripId !== null)}
        />
      )}

      {selectedTripType === "small-gatherings" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Small Get-togethers
          </h2>
          <p className="text-gray-600">
            Coming soon! Focus on Big Trips for now. 👥
          </p>
        </div>
      )}
    </div>
  );
};
