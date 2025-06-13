import React, { useState, useEffect } from "react";

interface EditFormProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  onClose: () => void;
  label: string;
}

export const EditForm = ({
  initialValue,
  onSave,
  onClose,
  label,
}: EditFormProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSave(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="editText"
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          type="text"
          id="editText"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
