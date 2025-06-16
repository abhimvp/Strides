import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import type { Task, DailyLog } from "../types";
import { toISODateString } from "../utils/date";

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSaveLog: (taskId: number, logNote: string) => void;
}

export const DailyLogModal = ({
  isOpen,
  onClose,
  task,
  onSaveLog,
}: DailyLogModalProps) => {
  const todayStr = toISODateString(new Date());
  const [currentLog, setCurrentLog] = useState("");

  useEffect(() => {
    // When the modal opens, pre-fill the textarea with today's log if it exists
    if (task) {
      const todaysEntry = task.daily_logs?.find((log) => log.date === todayStr);
      setCurrentLog(todaysEntry?.note || "");
    }
  }, [task, todayStr]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLog(task.id, currentLog);
    onClose();
  };

  const pastLogs = (task.daily_logs || [])
    .filter((log) => log.date !== todayStr)
    .reverse();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Daily Log: ${task.text}`}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="dailyLog"
              className="block text-sm font-medium text-gray-700"
            >
              Today's Log ({todayStr})
            </label>
            <textarea
              id="dailyLog"
              value={currentLog}
              onChange={(e) => setCurrentLog(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="What did you work on today?"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Log
            </button>
          </div>
        </div>
      </form>

      <hr className="my-6" />

      <div>
        <h4 className="font-semibold text-lg mb-2">Recent Logs</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {pastLogs.length > 0 ? (
            pastLogs.map((log) => (
              <div key={log.date} className="bg-slate-50 p-3 rounded-md">
                <p className="font-semibold text-sm text-slate-600">
                  {log.date}
                </p>
                <p className="text-slate-800 whitespace-pre-wrap">{log.note}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No past logs for this task.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
