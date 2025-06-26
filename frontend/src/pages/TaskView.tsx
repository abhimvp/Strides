import React, { useState, useEffect } from "react";
// import AIAgent from "../components/AIAgent";
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
import { DailyLogModal } from "../components/DailyLogModal";
// import { Header } from "../components/Header";
import { Modal } from "../components/Modal";
import { AddTaskForm } from "../components/AddTaskForm";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EditForm } from "../components/EditForm";
import { initialTasks } from "../data/mockTasks";
import type {
  UserTasks,
  Category,
  Task,
  TaskHistory,
  DailyLog,
  LoggableItem,
} from "../types";
import { getWeekDays, toISODateString } from "../utils/date";
import {
  getTasks,
  createInitialTasks,
  updateTasks,
} from "../services/taskService";
import { Plus } from "lucide-react";
import { MonthlyView } from "./MonthlyView";

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
  currentNotes?: string;
} | null;

// New type to reliably track the dragged item
type ActiveDragItem = { id: number; categoryName: string } | null;

type View = "weekly" | "monthly"; // Type for our view state

const DEFAULT_CATEGORY = "Not Yet Categorized";

export const TaskView = () => {
  const [loggingTask, setLoggingTask] = useState<Task | null>(null);
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo>(null);
  const [editingInfo, setEditingInfo] = useState<EditingInfo>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItem>(null);
  const [currentView, setCurrentView] = useState<View>("weekly"); // New state for tabs

  const weekData = getWeekDays();

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
    // Find the full task object to get its current notes
    const task = userTasks?.categories
      .find((c) => c.name === categoryName)
      ?.tasks.find((t) => t.id === taskId);
    setEditingInfo({
      type: "task",
      categoryName,
      taskId,
      currentText,
      currentNotes: task?.notes || "", // Pass current notes to the form
    });
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingInfo({
      type: "category",
      categoryName,
      currentText: categoryName,
    });
  };

  const handleEditSave = (data: {
    newText: string;
    newCategory?: string;
    newNotes?: string;
  }) => {
    if (!userTasks || !editingInfo) return;

    const { newText, newCategory, newNotes } = data;
    let newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const originalCategoryName = editingInfo.categoryName;

    if (editingInfo.type === "category") {
      const categoryToEdit = newCategories.find(
        (c: Category) => c.name === originalCategoryName
      );
      if (categoryToEdit) categoryToEdit.name = newText;
    } else {
      // type is 'task'
      const sourceCategory = newCategories.find(
        (c: Category) => c.name === originalCategoryName
      );
      const taskToUpdate = sourceCategory?.tasks.find(
        (t: Task) => t.id === editingInfo.taskId
      );
      if (sourceCategory && taskToUpdate) {
        taskToUpdate.text = newText;
        taskToUpdate.notes = newNotes || undefined;

        if (newCategory && newCategory !== originalCategoryName) {
          sourceCategory.tasks = sourceCategory.tasks.filter(
            (t: Task) => t.id !== editingInfo.taskId
          );
          const destinationCategory = newCategories.find(
            (c: Category) => c.name === newCategory
          );
          if (destinationCategory) destinationCategory.tasks.push(taskToUpdate);
          toast.success(`Task moved to "${newCategory}"`);
        } else {
          toast.success(`Task updated successfully!`);
        }
      }
    }
    updateAndSaveChanges(newCategories);
    setEditingInfo(null);
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
    let category = newCategories.find((c: Category) => c.name === categoryName);
    if (!category) {
      const newCategory: Category = { name: categoryName, tasks: [] };
      newCategories.push(newCategory);
      category = newCategory;
    }
    const newTask: Task = {
      id: Date.now(),
      text: taskData.text,
      notes: taskData.notes || undefined,
      history: [],
      move_history: [
        { category_name: categoryName, moved_at: new Date().toISOString() },
      ],
    };
    category.tasks.push(newTask);
    updateAndSaveChanges(newCategories);
    setOpenCategory(categoryName);
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

  // Replace your entire existing handleSaveLog function with this one.
  const handleSaveLog = (taskId: number, logNote: string) => {
    if (!userTasks || logNote.trim() === "") {
      return; // Do nothing if the note is empty
    }

    // Use the full ISO string to include the precise time in UTC.
    const newTimestamp = new Date().toISOString();

    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    let updatedTaskForModal: Task | null = null;

    for (const category of newCategories) {
      const task = category.tasks.find((t: Task) => t.id === taskId);
      if (task) {
        if (!task.daily_logs) {
          task.daily_logs = [];
        }
        // Always push a new log entry with the precise timestamp.
        task.daily_logs.push({ date: newTimestamp, note: logNote });

        updatedTaskForModal = task;
        break;
      }
    }

    if (updatedTaskForModal) {
      updateAndSaveChanges(newCategories);
      setLoggingTask(updatedTaskForModal);
      toast.success("Log saved!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
            {/* <Header /> */}
            <div className="flex items-center gap-4 mt-4">
              {/* New Global Add Task Button */}
              <button
                onClick={() => setIsGlobalTaskModalOpen(true)}
                className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 font-semibold"
              >
                <Plus size={16} />
                Add Task
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 font-semibold"
              >
                <Plus size={16} />
                Create a New Category
              </button>
              {isNewUser && (
                <button
                  onClick={handleSaveInitialTasks}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 font-semibold"
                >
                  Save My Strides
                </button>
              )}
            </div>
          </div>
          {/* View Switcher Tabs */}
          <div className="mb-6 border-b-2 border-slate-200">
            <nav className="-mb-0.5 flex space-x-6">
              <button
                onClick={() => setCurrentView("weekly")}
                className={`py-2 px-1 border-b-4 font-medium text-lg transition-colors ${
                  currentView === "weekly"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Weekly View
              </button>
              <button
                onClick={() => setCurrentView("monthly")}
                className={`py-2 px-1 border-b-4 font-medium text-lg transition-colors ${
                  currentView === "monthly"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Monthly View
              </button>
            </nav>
          </div>

          {currentView === "weekly" ? (
            <>
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
                  isNewUser={isNewUser}
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
                  onOpenLog={(task) => setLoggingTask(task)}
                />
              ))}

              {/* <div>
                <AIAgent />
              </div> */}
            </>
          ) : (
            <MonthlyView userTasks={userTasks} />
          )}
        </div>
      </div>
      {/* Updated Modal rendering for Global Add Task */}
      <Modal
        isOpen={isGlobalTaskModalOpen}
        onClose={() => setIsGlobalTaskModalOpen(false)}
        title="Add a New Task"
      >
        <AddTaskForm
          categories={[
            DEFAULT_CATEGORY,
            ...(userTasks?.categories.map((c) => c.name) || []),
          ]}
          defaultCategory={DEFAULT_CATEGORY}
          onAddTask={(taskData, categoryName) => {
            handleAddTask(categoryName, taskData);
            toast.success(`Task added to ${categoryName}!`);
          }}
          onClose={() => setIsGlobalTaskModalOpen(false)}
        />
      </Modal>
      {/* Updated Modal rendering for EditForm */}
      <Modal
        isOpen={!!editingInfo}
        onClose={() => setEditingInfo(null)}
        title={`Edit ${editingInfo?.type}`}
      >
        {editingInfo && (
          <EditForm
            initialText={editingInfo.currentText}
            initialNotes={editingInfo.currentNotes}
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
      <DailyLogModal
        isOpen={!!loggingTask}
        onClose={() => setLoggingTask(null)}
        item={
          loggingTask
            ? {
                id: String(loggingTask.id),
                title: loggingTask.text,
                logs: loggingTask.daily_logs || [],
              }
            : null
        }
        onSaveLog={(itemId, note) => handleSaveLog(Number(itemId), note)}
      />
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
