// src/components/trips/TripTypeSelector.tsx
import { Users, UserPlus } from "phosphor-react";
import type { TripType } from "../../types/trip";

interface TripTypeSelectorProps {
  selectedType: TripType;
  onTypeChange: (type: TripType) => void;
}

export const TripTypeSelector = ({
  selectedType,
  onTypeChange,
}: TripTypeSelectorProps) => {
  const tripTypes = [
    {
      id: "big-trips" as TripType,
      title: "Big Trips",
      description: "10+ people, multiple destinations",
      icon: Users,
      color: "bg-blue-100 text-blue-600 border-blue-200",
      activeColor: "bg-blue-600 text-white border-blue-600",
    },
    {
      id: "small-gatherings" as TripType,
      title: "Small Get-togethers",
      description: "2-5 people, casual hangouts",
      icon: UserPlus,
      color: "bg-green-100 text-green-600 border-green-200",
      activeColor: "bg-green-600 text-white border-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Choose Trip Type
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tripTypes.map((type) => {
          const IconComponent = type.icon;
          const isActive = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                isActive ? type.activeColor : type.color
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent size={24} />
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{type.title}</h3>
                  <p className="text-xs opacity-80">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedType === "small-gatherings" && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            🚧 Small Get-togethers feature is coming soon! For now, let's focus
            on Big Trips.
          </p>
        </div>
      )}
    </div>
  );
};
