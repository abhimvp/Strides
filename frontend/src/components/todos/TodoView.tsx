import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Plus } from "phosphor-react";
import toast from "react-hot-toast";

import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  addTodoLog,
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
import { TodoDetailSidebar } from "./TodoDetailSidebar";
import { ConfirmationDialog } from "../ConfirmationDialog";

const columns: TodoStatus[] = ["Not Started", "In Progress", "Done"];

type SidebarType = "add" | "edit" | "details" | null;

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

  // Direct update function for log operations (no API call needed)
  const handleDirectUpdate = (updatedTodo: TodoItem) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
    );
    setDetailTodo(updatedTodo);
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
      // Use direct update since addTodoLog already returns the updated todo
      handleDirectUpdate(result);
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

        {/* Sidebar for Add/Edit/Details */}
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
                  {sidebarType === "details" && "Todo Details"}
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
                  <TodoDetailSidebar
                    todo={detailTodo}
                    isOpen={true}
                    onClose={closeSidebar}
                    onUpdate={handleDirectUpdate}
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
