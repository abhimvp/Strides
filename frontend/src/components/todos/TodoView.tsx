import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  Plus,
  Trash,
  Clock,
  Tag,
  ChatCircle,
  PencilSimple,
  X,
  Check,
} from "phosphor-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  addTodoLog,
  updateTodoLog,
  deleteTodoLog,
} from "../../services/todoService";
import type {
  TodoItem,
  TodoStatus,
  CreateTodoData,
  UpdateTodoData,
  CreateTodoLogData,
} from "../../types";

import { KanbanColumn } from "./KanbanColumn";
import { AddTodoForm } from "./AddTodoForm";
import { ConfirmationDialog } from "../ConfirmationDialog";

const columns: TodoStatus[] = ["Not Started", "In Progress", "Done"];

type SidebarType = "add" | "edit" | "details" | null;

// Simple Todo Detail Form Component
const TodoDetailForm: React.FC<{
  todo: TodoItem;
  onUpdate: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
  onAddLog: (todoId: string, logData: CreateTodoLogData) => void;
}> = ({ todo, onUpdate, onDelete, onAddLog }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogText, setEditingLogText] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [editForm, setEditForm] = useState({
    title: todo.title,
    notes: todo.notes || "",
    status: todo.status,
  });

  const handleSave = () => {
    onUpdate({
      ...todo,
      title: editForm.title,
      notes: editForm.notes,
      status: editForm.status,
    });
    setIsEditing(false);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (logNotes.trim()) {
      onAddLog(todo.id, { notes: logNotes.trim() });
      setLogNotes("");
      setIsAddingLog(false);
    }
  };

  const handleEditLog = (logId: string, currentText: string) => {
    setEditingLogId(logId);
    setEditingLogText(currentText);
  };

  const handleUpdateLog = async (logId: string) => {
    if (editingLogText.trim()) {
      try {
        const updatedTodo = await updateTodoLog(todo.id, logId, {
          notes: editingLogText.trim(),
        });
        onUpdate(updatedTodo);
        setEditingLogId(null);
        setEditingLogText("");
        toast.success("Log updated successfully!");
      } catch (error) {
        console.error("Failed to update log:", error);
        toast.error("Failed to update log");
      }
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      try {
        const updatedTodo = await deleteTodoLog(todo.id, logId);
        onUpdate(updatedTodo);
        toast.success("Log deleted successfully!");
      } catch (error) {
        console.error("Failed to delete log:", error);
        toast.error("Failed to delete log");
      }
    }
  };

  const handleCancelLogEdit = () => {
    setEditingLogId(null);
    setEditingLogText("");
  };

  return (
    <div className="space-y-6">
      {/* Todo Info */}
      <div className="space-y-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Todo title"
            />
            <textarea
              value={editForm.notes}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              rows={3}
              placeholder="Notes (optional)"
            />
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: e.target.value as TodoStatus,
                }))
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800">
              {todo.title}
            </h3>
            {todo.notes && (
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {todo.notes}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                Status: {todo.status}
              </span>
            </div>
            {todo.createdAt && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Created:{" "}
                  {format(new Date(todo.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <PencilSimple size={16} />
            Edit
          </button>
          <button
            onClick={() => setIsAddingLog(!isAddingLog)}
            className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg transition-colors ${
              isAddingLog
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChatCircle size={16} />
            {isAddingLog ? "Cancel Log" : "Add Log"}
          </button>
        </div>
      )}

      {/* Add Log Form */}
      {isAddingLog && (
        <form
          onSubmit={handleLogSubmit}
          className="space-y-3 bg-gray-50 p-4 rounded-lg"
        >
          <h4 className="font-medium text-gray-800">Add Activity Log</h4>
          <textarea
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            rows={3}
            placeholder="Enter your log notes..."
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Log
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingLog(false);
                setLogNotes("");
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Logs */}
      {todo.logs && todo.logs.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <ChatCircle size={16} />
            Activity Logs ({todo.logs.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {todo.logs.map((log) => (
              <div key={log.id} className="bg-gray-50 p-3 rounded-lg">
                {editingLogId === log.id ? (
                  // Edit mode
                  <div className="space-y-2">
                    <textarea
                      value={editingLogText}
                      onChange={(e) => setEditingLogText(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateLog(log.id)}
                        className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
                      >
                        <Check size={12} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelLogEdit}
                        className="flex items-center gap-1 bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400 transition-colors"
                      >
                        <X size={12} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="group">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700 flex-1">
                        {log.notes}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLog(log.id, log.notes)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit log"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete log"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(
                        new Date(log.timestamp),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={() => {
          if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
            onDelete(todo);
          }
        }}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
      >
        <Trash size={16} />
        Delete Todo
      </button>
    </div>
  );
};

export const TodoView: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarType, setSidebarType] = useState<SidebarType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<TodoItem | null>(null);
  const [detailTodo, setDetailTodo] = useState<TodoItem | null>(null);

  // Sidebar functionality
  const openSidebar = useCallback(
    (type: SidebarType, todo: TodoItem | null = null) => {
      setSidebarType(type);
      setSidebarOpen(true);
      if (type === "edit" && todo) {
        setEditingTodo(todo);
      } else if (type === "details" && todo) {
        setDetailTodo(todo);
      }
    },
    []
  );

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setSidebarType(null);
    setEditingTodo(null);
    setDetailTodo(null);
  }, []);

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(250, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const userTodos = await getTodos();
        setTodos(userTodos);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
        toast.error("Failed to load To-Do items.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedTodo = todos.find((t) => t.id === active.id);
    const newStatus = over.id as TodoStatus;

    if (draggedTodo && draggedTodo.status !== newStatus) {
      const originalTodos = todos;
      const now = new Date().toISOString();

      // Prepare the update data with timestamps
      const updateData: UpdateTodoData = { status: newStatus };

      // Add timestamps based on the new status
      if (newStatus === "In Progress" && !draggedTodo.inProgressAt) {
        updateData.inProgressAt = now;
      } else if (newStatus === "Done" && !draggedTodo.completedAt) {
        updateData.completedAt = now;
      }

      // Optimistic UI update with timestamps
      setTodos((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? {
                ...t,
                status: newStatus,
                ...(newStatus === "In Progress" &&
                  !t.inProgressAt && { inProgressAt: now }),
                ...(newStatus === "Done" &&
                  !t.completedAt && { completedAt: now }),
              }
            : t
        )
      );

      try {
        await updateTodo(draggedTodo.id, updateData);
        toast.success(`Moved "${draggedTodo.title}" to ${newStatus}`);
      } catch (err) {
        console.error("Failed to update todo status:", err);
        toast.error("Failed to update status. Reverting.");
        setTodos(originalTodos); // Revert on error
      }
    }
  };

  const handleSaveTodo = async (data: CreateTodoData | UpdateTodoData) => {
    const toastId = toast.loading(
      editingTodo ? "Updating item..." : "Adding item..."
    );
    try {
      if (editingTodo) {
        const updated = await updateTodo(
          editingTodo.id,
          data as UpdateTodoData
        );
        setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Item updated!", { id: toastId });
      } else {
        const created = await createTodo(data as CreateTodoData);
        setTodos([created, ...todos]);
        toast.success("Item added!", { id: toastId });
      }
      closeSidebar();
    } catch (err) {
      console.error("Failed to save todo:", err);
      toast.error("Could not save item.", { id: toastId });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    const toastId = toast.loading("Deleting item...");
    try {
      await deleteTodo(deletingTodo.id);
      setTodos(todos.filter((t) => t.id !== deletingTodo.id));
      toast.success("Item deleted.", { id: toastId });
      setDeletingTodo(null);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      toast.error("Could not delete item.", { id: toastId });
    }
  };

  const handleViewDetails = (todo: TodoItem) => {
    openSidebar("details", todo);
  };

  const handleEditTodo = (todo: TodoItem) => {
    openSidebar("edit", todo);
  };

  const handleAddLog = (todo: TodoItem) => {
    openSidebar("details", todo);
  };

  const handleUpdateFromDetail = async (updatedTodo: TodoItem) => {
    try {
      const result = await updateTodo(updatedTodo.id, updatedTodo);
      setTodos((prev) => prev.map((t) => (t.id === result.id ? result : t)));
      // Update the detail view with the latest data
      setDetailTodo(result);
      toast.success("Todo updated successfully!");
    } catch (err) {
      console.error("Failed to update todo:", err);
      toast.error("Failed to update todo");
    }
  };

  const handleDeleteFromDetail = async (todo: TodoItem) => {
    try {
      await deleteTodo(todo.id);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      setDetailTodo(null);
      toast.success("Todo deleted successfully!");
    } catch (err) {
      console.error("Failed to delete todo:", err);
      toast.error("Failed to delete todo");
    }
  };

  const handleAddLogFromDetail = async (
    todoId: string,
    logData: CreateTodoLogData
  ) => {
    try {
      const result = await addTodoLog(todoId, logData);
      setTodos((prev) => prev.map((t) => (t.id === result.id ? result : t)));
      // Update the detail view with the latest data
      setDetailTodo(result);
      toast.success("Log added successfully!");
    } catch (err) {
      console.error("Failed to add log:", err);
      toast.error("Failed to add log");
    }
  };

  if (isLoading) return <p>Loading To-Do board...</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => openSidebar("add")}
              className="flex items-center gap-2 bg-black text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-800"
            >
              <Plus size={16} />
              Add To-Do
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                todos={todos.filter((t) => t.status === status)}
                onEdit={handleEditTodo}
                onDelete={setDeletingTodo}
                onLog={handleAddLog}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 relative"
            style={{ width: `${sidebarWidth}px` }}
          >
            {/* Resize Handle */}
            <div
              className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-200 hover:bg-gray-300 transition-colors"
              onMouseDown={handleMouseDown}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black">
                  {sidebarType === "add" && "Add To-Do"}
                  {sidebarType === "edit" && "Edit To-Do"}
                  {sidebarType === "details" && "To-Do Details"}
                </h2>
                <button
                  onClick={closeSidebar}
                  className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {(sidebarType === "add" || sidebarType === "edit") && (
                  <AddTodoForm
                    onSave={handleSaveTodo}
                    onClose={closeSidebar}
                    existingTodo={editingTodo}
                  />
                )}

                {sidebarType === "details" && detailTodo && (
                  <TodoDetailForm
                    todo={detailTodo}
                    onUpdate={handleUpdateFromDetail}
                    onDelete={handleDeleteFromDetail}
                    onAddLog={handleAddLogFromDetail}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete To-Do"
        message={`Are you sure you want to delete "${deletingTodo?.title}"? This cannot be undone.`}
      />
    </DndContext>
  );
};
