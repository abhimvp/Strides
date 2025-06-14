import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import toast from "react-hot-toast";
import { TaskList } from "../components/TaskList";
import { Header } from "../components/Header";
import { Modal } from "../components/Modal";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EditForm } from "../components/EditForm";
import { initialTasks } from "../data/mockTasks";
import type { UserTasks, Category, Task, TaskHistory } from "../types";
import { getWeekDays } from "../utils/date";
import { useAuth } from "../hooks/useAuth";
import {
  getTasks,
  createInitialTasks,
  updateTasks,
} from "../services/taskService";
import { PlusCircle } from "lucide-react";

type DeletionInfo = {
  type: "task" | "category";
  name: string;
  id?: number;
} | null;

type EditingInfo = {
  type: "task" | "category";
  categoryName: string;
  taskId?: number;
  currentText: string;
} | null;

// New type to reliably track the dragged item
type ActiveDragItem = { id: number; categoryName: string } | null;

export const Dashboard = () => {
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo>(null);
  const [editingInfo, setEditingInfo] = useState<EditingInfo>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItem>(null);

  const weekData = getWeekDays();
  const { logout } = useAuth();

  // Update useEffect to open the first category on load
  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const data = await getTasks();
        if (data && data.categories.length === 0 && !data.id) {
          const initialData = {
            owner_id: data.owner_id,
            categories: initialTasks.categories,
          };
          setUserTasks(initialData);
          setOpenCategory(initialData.categories[0]?.name || null);
          setIsNewUser(true);
        } else {
          setUserTasks(data);
          if (data && data.categories.length > 0) {
            setOpenCategory(data.categories[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserTasks();
  }, []);

  // Improve drag-and-drop for touch and mouse
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // --- DND Event Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Reliably store the active item's info when the drag begins
    setActiveDragItem({
      id: active.id as number,
      categoryName: active.data.current?.categoryName,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over || !activeDragItem) return;

    const overId = over.id as string;
    const overCategoryName =
      over.data.current?.type === "Category"
        ? overId
        : over.data.current?.categoryName;

    if (overCategoryName && openCategory !== overCategoryName) {
      // This prevents a setState call during render if you just moved the mouse slightly
      if (activeDragItem.categoryName !== overCategoryName) {
        setOpenCategory(overCategoryName);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeDragItem) return;
    const { over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const sourceCategoryName = activeDragItem.categoryName;
    let destinationCategoryName;
    if (over.data.current?.type === "Category") {
      destinationCategoryName = over.id as string;
    } else {
      destinationCategoryName = over.data.current?.categoryName;
    }

    if (
      !sourceCategoryName ||
      !destinationCategoryName ||
      sourceCategoryName === destinationCategoryName
    ) {
      return;
    }

    setUserTasks((prev) => {
      if (!prev) return null;
      const newCategories = JSON.parse(JSON.stringify(prev.categories));
      const sourceCategory = newCategories.find(
        (c: Category) => c.name === sourceCategoryName
      );
      const destinationCategory = newCategories.find(
        (c: Category) => c.name === destinationCategoryName
      );
      if (!sourceCategory || !destinationCategory) return prev;

      const taskIndex = sourceCategory.tasks.findIndex(
        (t: Task) => t.id === activeDragItem.id
      );
      if (taskIndex === -1) return prev;

      const [movedTask] = sourceCategory.tasks.splice(taskIndex, 1);
      if (!movedTask.move_history) movedTask.move_history = [];
      movedTask.move_history.push({
        category_name: destinationCategory.name,
        moved_at: new Date().toISOString(),
      });
      destinationCategory.tasks.push(movedTask);

      updateAndSaveChanges(newCategories);
      toast.success(`Task moved to "${destinationCategory.name}"`);
      return { ...prev, categories: newCategories };
    });
  };

  const handleSaveInitialTasks = async () => {
    if (!userTasks) return;
    const toastId = toast.loading("Saving your setup...");
    try {
      const savedTasks = await createInitialTasks(userTasks.categories);
      setUserTasks(savedTasks);
      setIsNewUser(false);
      toast.success("Your Strides have been saved!", { id: toastId });
    } catch (error) {
      console.error("Failed to save initial tasks:", error);
      toast.error("Could not save your setup.", { id: toastId });
    }
  };

  const updateAndSaveChanges = async (newCategories: Category[]) => {
    const previousTasks = userTasks; // Keep a backup to revert on error
    setUserTasks((prev) =>
      prev ? { ...prev, categories: newCategories } : null
    );
    if (!isNewUser) {
      try {
        await updateTasks(newCategories);
        // A success toast here can be a bit noisy on every check, so we can omit it.
      } catch (error) {
        console.error("Failed to update tasks:", error);
        toast.error("Failed to save changes. Reverting.");
        setUserTasks(previousTasks); // Revert to previous state on error
      }
    }
  };

  const handleCategoryHeaderClick = (categoryName: string) => {
    setOpenCategory((prevOpenCategory) =>
      prevOpenCategory === categoryName ? null : categoryName
    );
  };

  const handleEditTask = (
    categoryName: string,
    taskId: number,
    currentText: string
  ) => {
    setEditingInfo({
      type: "task",
      categoryName,
      taskId,
      currentText,
    });
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingInfo({
      type: "category",
      categoryName,
      currentText: categoryName,
    });
  };

  const handleEditSave = (newValue: string) => {
    if (!userTasks || !editingInfo) return;
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    if (editingInfo.type === "category") {
      const category = newCategories.find(
        (c: Category) => c.name === editingInfo.categoryName
      );
      if (category) category.name = newValue;
    } else {
      // type is 'task'
      const category = newCategories.find(
        (c: Category) => c.name === editingInfo.categoryName
      );
      if (category) {
        const task = category.tasks.find(
          (t: Task) => t.id === editingInfo.taskId
        );
        if (task) task.text = newValue;
      }
    }
    updateAndSaveChanges(newCategories);
    toast.success(`Item updated successfully!`);
    setEditingInfo(null); // Close the modal
  };

  const handleAddCategory = (categoryName: string) => {
    if (!userTasks) return;
    const doesExist = userTasks.categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (doesExist) {
      alert("A category with this name already exists.");
      return;
    }
    const newCategory: Category = { name: categoryName, tasks: [] };
    const newCategories = [...userTasks.categories, newCategory];
    updateAndSaveChanges(newCategories);
    // THE FIX: Set the new category as the open one
    setOpenCategory(categoryName);
    toast.success(`Category "${categoryName}" successfully!`);
  };

  const handleAddTask = (
    categoryName: string,
    taskData: { text: string; notes?: string }
  ) => {
    if (!userTasks) return;
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const category = newCategories.find(
      (c: Category) => c.name === categoryName
    );
    if (category) {
      const newTask: Task = {
        id: Date.now(),
        text: taskData.text,
        notes: taskData.notes || undefined,
        history: [],
      };
      category.tasks.push(newTask);
      updateAndSaveChanges(newCategories);
    }
  };

  const handleToggleTask = (
    categoryName: string,
    taskId: number,
    date: string,
    currentState: boolean
  ) => {
    if (!userTasks) return;
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const category = newCategories.find(
      (c: Category) => c.name === categoryName
    );
    if (category) {
      const task = category.tasks.find((t: Task) => t.id === taskId);
      if (task) {
        const historyEntry = task.history.find(
          (h: TaskHistory) => h.date === date
        );
        if (historyEntry) {
          historyEntry.completed = !currentState;
        } else {
          task.history.push({ date, completed: true });
        }
      }
    }
    updateAndSaveChanges(newCategories);
  };

  const handleDeleteTask = (categoryName: string, taskId: number) => {
    setDeletionInfo({ type: "task", name: categoryName, id: taskId });
  };

  const handleDeleteCategory = (categoryName: string) => {
    setDeletionInfo({ type: "category", name: categoryName });
  };

  const confirmDeletion = () => {
    if (!userTasks || !deletionInfo) return;

    let newCategories;

    if (deletionInfo.type === "category") {
      newCategories = userTasks.categories.filter(
        (cat) => cat.name !== deletionInfo.name
      );
    } else {
      // type is 'task'
      newCategories = JSON.parse(JSON.stringify(userTasks.categories));
      const category = newCategories.find(
        (c: Category) => c.name === deletionInfo.name
      );
      if (category) {
        category.tasks = category.tasks.filter(
          (task: Task) => task.id !== deletionInfo.id
        );
      }
    }

    updateAndSaveChanges(newCategories);
    toast.success(`'${deletionInfo?.type}' deleted successfully.`);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your Strides...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
          <div className="flex justify-between items-start mb-4">
            <Header />
            <div className="flex items-center gap-4 mt-4">
              {isNewUser && (
                <button
                  onClick={handleSaveInitialTasks}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 font-semibold"
                >
                  Save My Strides
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {isNewUser && (
            <div
              className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md"
              role="alert"
            >
              <p className="font-bold">Welcome to Strides!</p>
              <p>
                We've started you off with some example tasks. Feel free to
                edit, add, or delete them, then click "Save My Strides" to
                begin!
              </p>
            </div>
          )}

          {userTasks?.categories.map((category) => (
            <TaskList
              key={category.name}
              category={category.name}
              tasks={category.tasks}
              weekDays={weekData}
              weekDates={weekData}
              isOpen={openCategory === category.name}
              onHeaderClick={() => handleCategoryHeaderClick(category.name)}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onEditCategory={handleEditCategory}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDeleteCategory={handleDeleteCategory}
            />
          ))}

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 text-lg text-slate-600 hover:text-blue-600 transition-colors py-2 px-4"
            >
              <PlusCircle size={24} />
              Create a New Category
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={!!editingInfo}
        onClose={() => setEditingInfo(null)}
        title={`Edit ${editingInfo?.type}`}
      >
        {editingInfo && (
          <EditForm
            initialValue={editingInfo.currentText}
            onSave={handleEditSave}
            onClose={() => setEditingInfo(null)}
            label={`${
              editingInfo.type === "category" ? "Category" : "Task"
            } Name`}
            isTask={editingInfo.type === "task"}
            categories={userTasks?.categories.map((c) => c.name) || []}
            currentCategory={editingInfo.categoryName}
          />
        )}
      </Modal>
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create New Category"
      >
        <AddCategoryForm
          onAddCategory={handleAddCategory}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
      <ConfirmationDialog
        isOpen={!!deletionInfo}
        onClose={() => setDeletionInfo(null)}
        onConfirm={confirmDeletion}
        title={`Delete ${deletionInfo?.type}`}
        message={`Are you sure you want to delete this ${deletionInfo?.type}? This action cannot be undone.`}
      />
    </DndContext>
  );
};
