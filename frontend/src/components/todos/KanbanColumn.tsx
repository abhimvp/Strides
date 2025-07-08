import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { TodoItem, TodoStatus } from "../../types";
import { TodoCard } from "./TodoCard";

interface KanbanColumnProps {
  status: TodoStatus;
  todos: TodoItem[];
  onEdit: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
  onLog: (todo: TodoItem) => void;
  onViewDetails: (todo: TodoItem) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  todos,
  onEdit,
  onDelete,
  onLog,
  onViewDetails,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const statusColor = {
    "Not Started": "bg-gray-500",
    "In Progress": "bg-gray-700",
    Done: "bg-black",
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg bg-gray-800/50 transition-colors ${
        isOver ? "bg-gray-700" : ""
      }`}
    >
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <span
          className={`w-3 h-3 rounded-full mr-2 ${statusColor[status]}`}
        ></span>
        {status}
        <span className="ml-2 text-sm text-gray-400 bg-gray-700 rounded-full px-2">
          {todos.length}
        </span>
      </h3>
      <div className="space-y-4 min-h-[200px]">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onEdit={onEdit}
            onDelete={onDelete}
            onLog={onLog}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};
