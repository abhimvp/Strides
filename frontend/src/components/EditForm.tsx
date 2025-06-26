import { useState, useEffect } from "react";

interface EditFormData {
  newText: string;
  newCategory?: string;
  newNotes?: string;
}

interface EditFormProps {
  initialText: string;
  initialNotes?: string;
  onSave: (data: EditFormData) => void;
  onClose: () => void;
  label: string;
  isTask: boolean;
  categories: string[];
  currentCategory: string;
}

export const EditForm = ({
  initialText,
  initialNotes = "",
  onSave,
  onClose,
  label,
  isTask,
  categories,
  currentCategory,
}: EditFormProps) => {
  const [textValue, setTextValue] = useState(initialText);
  const [notesValue, setNotesValue] = useState(initialNotes);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  useEffect(() => {
    setTextValue(initialText);
    setNotesValue(initialNotes);
    setSelectedCategory(currentCategory);
  }, [initialText, initialNotes, currentCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textValue.trim()) {
      onSave({
        newText: textValue.trim(),
        newCategory: selectedCategory,
        newNotes: notesValue.trim(),
      });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="editText"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            {label}
          </label>
          <input
            type="text"
            id="editText"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>
        {isTask && (
          <>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="editNotes"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Notes (Optional)
              </label>
              <textarea
                id="editNotes"
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
