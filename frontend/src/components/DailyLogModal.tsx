import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import type { LoggableItem } from "../types";
import { format } from "date-fns";

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LoggableItem | null;
  onSaveLog: (itemId: string, note: string) => void;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  item,
  onSaveLog,
}) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [item]);

  const handleSave = () => {
    if (item && note.trim()) {
      onSaveLog(item.id, note.trim());
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Logs for: ${item.title}`}>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="log-note"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            New Log Entry
          </label>
          <textarea
            id="log-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add your update here..."
            className="w-full p-3 rounded-md bg-slate-800 text-slate-100 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {item.logs && item.logs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-600 mb-3">
              History
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-l-2 border-slate-700 ml-1 pl-5">
              {item.logs
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((log, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/70 border border-slate-700 p-3 rounded-lg relative"
                  >
                    <div className="absolute -left-[29px] top-4 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-700"></div>
                    <p className="text-xs text-slate-400 font-medium">
                      {format(new Date(log.date), "MMMM d, yyyy - h:mm a")}
                    </p>
                    <p className="text-slate-100 mt-1.5 whitespace-pre-wrap">
                      {log.note}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!note.trim()}
          >
            Save Log
          </button>
        </div>
      </div>
    </Modal>
  );
};
