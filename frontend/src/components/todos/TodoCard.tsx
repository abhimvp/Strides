import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVertical,
  PencilSimple,
  Trash,
  ChatCircle,
} from "phosphor-react";
import type { TodoItem } from "../../types";
import { format } from "date-fns";
import { getTodoStatusMessage } from "../../utils/date";

interface TodoCardProps {
  todo: TodoItem;
  onEdit: (todo: TodoItem) => void;
  onDelete: (todo: TodoItem) => void;
  onLog: (todo: TodoItem) => void;
  onViewDetails: (todo: TodoItem) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onEdit,
  onDelete,
  onLog,
  onViewDetails,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: todo.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700 group cursor-pointer hover:border-gray-600 transition-colors"
      onClick={() => onViewDetails(todo)}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-white">{todo.title}</h4>
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none text-gray-500 hover:text-white"
          onClick={(e) => e.stopPropagation()} // Prevent triggering the card click when dragging
        >
          <DotsSixVertical size={20} />
        </div>
      </div>
      {todo.notes && <p className="text-sm text-gray-400 mt-2">{todo.notes}</p>}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700/50">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500">
            Created: {format(new Date(todo.createdAt), "MMM d, yyyy")}
          </p>
          <p className="text-xs text-gray-400">{getTodoStatusMessage(todo)}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="text-gray-400 hover:text-blue-400"
          >
            <PencilSimple size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLog(todo);
            }}
            className="text-gray-400 hover:text-green-400"
          >
            <ChatCircle size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo);
            }}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
