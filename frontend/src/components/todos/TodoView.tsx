import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
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
import { Modal } from "../Modal";
import { AddTodoForm } from "./AddTodoForm";
import { ConfirmationDialog } from "../ConfirmationDialog";
// We can reuse the DailyLogModal if it's generic enough, or create a new one.
// For now, let's assume we can reuse it with minor adaptations if needed.
import { DailyLogModal } from "../DailyLogModal";

const columns: TodoStatus[] = ["Not Started", "In Progress", "Done"];

export const TodoView: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<TodoItem | null>(null);
  const [loggingTodo, setLoggingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const userTodos = await getTodos();
        setTodos(userTodos);
      } catch (error) {
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
      // Optimistic UI update
      setTodos((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, status: newStatus } : t))
      );

      try {
        await updateTodo(draggedTodo.id, { status: newStatus });
        toast.success(`Moved "${draggedTodo.title}" to ${newStatus}`);
      } catch (error) {
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
      setEditingTodo(null);
      setIsModalOpen(false);
    } catch (error) {
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
    } catch (error) {
      toast.error("Could not delete item.", { id: toastId });
    }
  };

  const handleSaveLog = async (taskId: string, logNote: string) => {
    const toastId = toast.loading("Saving log...");
    try {
      const data: CreateTodoLogData = { notes: logNote };
      const updatedTodo = await addTodoLog(taskId, data);
      setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
        
        // This is the fix: Update the todo being viewed in the modal
        setLoggingTodo(updatedTodo);
      toast.success("Log saved!", { id: toastId });
      
    } catch (error) {
      toast.error("Failed to save log.", { id: toastId });
    }
  };

  if (isLoading) return <p>Loading To-Do board...</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mt-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setEditingTodo(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700"
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
              onEdit={setEditingTodo}
              onDelete={setDeletingTodo}
              onLog={setLoggingTodo}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen || !!editingTodo}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        title={editingTodo ? "Edit To-Do" : "Add To-Do"}
      >
        <AddTodoForm
          onSave={handleSaveTodo}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTodo(null);
          }}
          existingTodo={editingTodo}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete To-Do"
        message={`Are you sure you want to delete "${deletingTodo?.title}"? This cannot be undone.`}
      />

      {/* The DailyLogModal might need slight adaptation if its props are strictly typed to `Task` */}
      <DailyLogModal
        isOpen={!!loggingTodo}
        onClose={() => setLoggingTodo(null)}
        // Adapt the `loggingTodo` to the new `LoggableItem` structure
        item={
          loggingTodo
            ? {
                id: loggingTodo.id,
                title: loggingTodo.title,
                logs: loggingTodo.logs.map((l) => ({
                  date: l.timestamp,
                  note: l.notes,
                })),
              }
            : null
        }
        onSaveLog={handleSaveLog}
      />
    </DndContext>
  );
};
