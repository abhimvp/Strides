import React, { useState, useEffect } from "react";
import {
  Clock,
  Tag,
  ChatCircle,
  PencilSimple,
  Check,
  Trash,
  Plus,
} from "phosphor-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import type { TodoItem, TodoStatus, CreateTodoLogData } from "../../types";
import { getTodoStatusMessage, getTimeAgo } from "../../utils/date";
import {
  updateTodoLog,
  deleteTodoLog,
  updateTodo,
} from "../../services/todoService";

interface TodoDetailSidebarProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
  onAddLog: (todoId: string, logData: CreateTodoLogData) => void;
}

const statusOptions: { value: TodoStatus; label: string; color: string }[] = [
  { value: "Not Started", label: "Not Started", color: "bg-gray-500" },
  { value: "In Progress", label: "In Progress", color: "bg-gray-700" },
  { value: "Done", label: "Done", color: "bg-black" },
];

export const TodoDetailSidebar: React.FC<TodoDetailSidebarProps> = ({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddLog,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    notes: "",
    status: "Not Started" as TodoStatus,
  });
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logNotes, setLogNotes] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogNotes, setEditingLogNotes] = useState("");

  useEffect(() => {
    if (todo) {
      setEditForm({
        title: todo.title,
        notes: todo.notes || "",
        status: todo.status,
      });
    }
    // Reset all editing states when todo changes to prevent "three times" issue
    setEditingLogId(null);
    setEditingLogNotes("");
    setIsAddingLog(false);
    setLogNotes("");
    setIsEditing(false); // Also reset main editing state
  }, [todo]); // Keep full todo dependency but structure to avoid issues

  if (!isOpen || !todo) {
    return null;
  }

  const handleSaveEdit = async () => {
    try {
      const updateData: Partial<TodoItem> = {
        title: editForm.title,
        notes: editForm.notes || undefined,
      };

      // Add timestamp logic based on status change
      if (editForm.status !== todo.status) {
        updateData.status = editForm.status;
        const now = new Date().toISOString();

        if (editForm.status === "In Progress" && !todo.inProgressAt) {
          updateData.inProgressAt = now;
        } else if (editForm.status === "Done" && !todo.completedAt) {
          updateData.completedAt = now;
        }
      }

      // Make API call for todo property updates
      const updatedTodo = await updateTodo(todo.id, updateData);
      onUpdate(updatedTodo);
      setIsEditing(false);
      toast.success("Todo updated successfully!");
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const handleAddLog = async () => {
    if (!logNotes.trim()) {
      toast.error("Please enter log notes");
      return;
    }

    try {
      await onAddLog(todo.id, { notes: logNotes });
      setLogNotes("");
      setIsAddingLog(false);
      toast.success("Log added successfully!");
    } catch (error) {
      console.error("Failed to add log:", error);
      toast.error("Failed to add log");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!logId) {
      console.error("Log ID is undefined or empty");
      toast.error("Error: Log ID is missing");
      return;
    }

    try {
      const updatedTodo = await deleteTodoLog(todo.id, logId);
      onUpdate(updatedTodo);
      toast.success("Log deleted successfully!");
    } catch (error) {
      console.error("Failed to delete log:", error);
      toast.error("Failed to delete log");
    }
  };

  const handleEditLog = (logId: string, currentNotes: string) => {
    setEditingLogId(logId);
    setEditingLogNotes(currentNotes);
  };

  const handleSaveLogEdit = async (logId: string) => {
    if (!editingLogNotes.trim()) {
      toast.error("Please enter log notes");
      return;
    }

    try {
      const updatedTodo = await updateTodoLog(todo.id, logId, {
        notes: editingLogNotes,
      });
      onUpdate(updatedTodo);
      setEditingLogId(null);
      setEditingLogNotes("");
      toast.success("Log updated successfully!");
    } catch (error) {
      console.error("Failed to update log:", error);
      toast.error("Failed to update log");
    }
  };

  const handleCancelLogEdit = () => {
    setEditingLogId(null);
    setEditingLogNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">Title</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <PencilSimple size={16} />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Todo title"
            />

            <textarea
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Notes (optional)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as TodoStatus,
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Check size={16} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">{todo.title}</h1>
            {todo.notes && (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {todo.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
          <Tag size={20} />
          Status
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
              statusOptions.find((opt) => opt.value === todo.status)?.color
            }`}
          >
            {todo.status}
          </span>
          <span className="text-sm text-gray-500">
            {getTodoStatusMessage(todo)}
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
          <Clock size={20} />
          Timeline
        </h3>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Created</span>
            <span className="text-gray-900">
              {format(new Date(todo.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          {todo.inProgressAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Started</span>
              <span className="text-gray-900">
                {format(new Date(todo.inProgressAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}

          {todo.completedAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="text-gray-900">
                {format(new Date(todo.completedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <ChatCircle size={20} />
            Activity Logs ({todo.logs.length})
          </h3>
          <button
            onClick={() => setIsAddingLog(true)}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-gray-100 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Log
          </button>
        </div>

        {/* Add Log Form */}
        {isAddingLog && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Add your log notes..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddLog}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Log
              </button>
              <button
                onClick={() => {
                  setIsAddingLog(false);
                  setLogNotes("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {todo.logs.length === 0 ? (
            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
              No activity logs yet. Add the first log to track progress!
            </p>
          ) : (
            todo.logs
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((log) => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {format(
                          new Date(log.timestamp),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(log.timestamp)}
                      </span>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditLog(log.id, log.notes)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-200"
                          title="Edit log"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-200"
                          title="Delete log"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingLogId === log.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingLogNotes}
                        onChange={(e) => setEditingLogNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Edit log notes..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveLogEdit(log.id)}
                          className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800 flex items-center gap-1"
                        >
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          onClick={handleCancelLogEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900">{log.notes}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this todo?")
              ) {
                onDelete(todo);
                onClose();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash size={16} />
            Delete Todo
          </button>
        </div>
      </div>
    </div>
  );
};
