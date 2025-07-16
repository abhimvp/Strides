import { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { TaskList } from "../components/TaskList";
// import { Header } from "../components/Header";
import { Modal } from "../components/Modal";
import { AddTaskForm } from "../components/AddTaskForm";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EditForm } from "../components/EditForm";
import { initialTasks } from "../data/mockTasks";
import type { UserTasks, Category, Task, TaskHistory } from "../types";
import {
  getTasks,
  createInitialTasks,
  updateTasks,
  deleteTaskLog,
} from "../services/taskService";
import { Plus, CaretLeft, CaretRight, Trash } from "phosphor-react";
import { Button } from "../components/ui/Button";
import { CategorySkeleton } from "../components/ui/Skeleton";

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

const DEFAULT_CATEGORY = "Not Yet Categorized";

// Helper function to get week data for a specific date
const getWeekDaysForDate = (date: Date) => {
  const days = [];

  // Create a date in local timezone to avoid timezone shifts
  const startOfWeek = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const day = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + i
    );
    days.push(day);
  }
  return days;
};

export const TaskView = () => {
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo>(null);
  const [editingInfo, setEditingInfo] = useState<EditingInfo>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragItem>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Initialize with the proper start of the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    return startOfWeek;
  });

  // New state for sidebar editing
  const [sidebarEditingTask, setSidebarEditingTask] = useState<Task | null>(
    null
  );
  const [sidebarMode, setSidebarMode] = useState<
    "calendar" | "edit-notes" | "edit-logs" | "add-task" | "add-category"
  >("calendar");
  const [selectedCategoryForAddTask, setSelectedCategoryForAddTask] =
    useState<string>("");
  const [tempNotes, setTempNotes] = useState<string>("");
  const [tempLogNote, setTempLogNote] = useState<string>("");
  const [logsToShow, setLogsToShow] = useState<number>(7);
  const [selectedLogDate, setSelectedLogDate] = useState<string>("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Generate week data based on current week
  const weekData = getWeekDaysForDate(currentWeekStart);

  // Helper functions for week navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    setCurrentWeekStart(startOfWeek);
  };

  const formatWeekRange = (weekStart: Date[]) => {
    if (weekStart.length === 0) return "";
    const start = weekStart[0];
    const end = weekStart[6];

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      )}`;
    } else {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
  };

  // New handlers for sidebar editing
  const handleSidebarEditNotes = (task: Task) => {
    setSidebarEditingTask(task);
    setSidebarMode("edit-notes");
    setTempNotes(task.notes || "");
  };

  const handleSidebarEditLogs = (task: Task) => {
    setSidebarEditingTask(task);
    setSidebarMode("edit-logs");
    setTempLogNote("");
    setSelectedLogDate(new Date().toISOString().split("T")[0]);
    setLogsToShow(7); // Reset pagination when opening a new task
    setEditingLogId(null); // Reset editing state
  };

  const handleSidebarAddTask = (categoryName?: string) => {
    setSidebarEditingTask(null);
    setSelectedCategoryForAddTask(categoryName || DEFAULT_CATEGORY);
    setSidebarMode("add-task");
  };

  const handleSidebarAddCategory = () => {
    setSidebarEditingTask(null);
    setSidebarMode("add-category");
  };

  const handleSaveNotes = () => {
    if (!sidebarEditingTask || !userTasks) return;

    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const category = newCategories.find((c: Category) =>
      c.tasks.some((t: Task) => t.id === sidebarEditingTask.id)
    );

    if (category) {
      const task = category.tasks.find(
        (t: Task) => t.id === sidebarEditingTask.id
      );
      if (task) {
        task.notes = tempNotes;

        // Update the sidebar editing task with the new notes
        setSidebarEditingTask(task);

        updateAndSaveChanges(newCategories);
        toast.success("Notes updated successfully!");
      }
    }
  };

  const handleSaveTaskLog = (itemId: number, note: string) => {
    if (!userTasks) return;

    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const category = newCategories.find((c: Category) =>
      c.tasks.some((t: Task) => t.id === itemId)
    );

    if (category) {
      const task = category.tasks.find((t: Task) => t.id === itemId);
      if (task) {
        if (!task.daily_logs) task.daily_logs = [];

        if (editingLogId) {
          // Editing existing log
          const existingLogIndex = task.daily_logs.findIndex(
            (log: { date: string; note: string; created_at?: string }) => {
              const logId = log.created_at || log.date;
              return logId === editingLogId;
            }
          );

          if (existingLogIndex >= 0) {
            task.daily_logs[existingLogIndex].note = note;
            task.daily_logs[existingLogIndex].date = selectedLogDate;
          }
        } else {
          // Creating new log
          task.daily_logs.push({
            date: selectedLogDate,
            note: note,
            created_at: new Date().toISOString(),
          });
        }

        // Update the sidebar editing task with the new log data
        setSidebarEditingTask(task);

        updateAndSaveChanges(newCategories);
        toast.success(
          editingLogId ? "Log updated successfully!" : "Log saved successfully!"
        );
        setTempLogNote("");
        setEditingLogId(null);
      }
    }
  };

  const handleDeleteTaskLog = async (itemId: number, logId: string) => {
    if (!userTasks) return;

    try {
      // Call the API to delete the log
      await deleteTaskLog(itemId, logId);

      // Update local state to reflect the change immediately
      const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
      const category = newCategories.find((c: Category) =>
        c.tasks.some((t: Task) => t.id === itemId)
      );

      if (category) {
        const task = category.tasks.find((t: Task) => t.id === itemId);
        if (task && task.daily_logs) {
          // Remove the log with the matching unique identifier (created_at or date)
          task.daily_logs = task.daily_logs.filter(
            (log: { date: string; note: string; created_at?: string }) => {
              const currentLogId = log.created_at || log.date;
              return currentLogId !== logId;
            }
          );

          // Update the sidebar editing task with the updated log data
          setSidebarEditingTask(task);

          // Update local state
          setUserTasks({ ...userTasks, categories: newCategories });
          toast.success("Log deleted successfully!");
        }
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("Failed to delete log. Please try again.");
    }
  };

  const handleCloseSidebar = () => {
    setSidebarEditingTask(null);
    setSidebarMode("calendar");
    setTempNotes("");
    setTempLogNote("");
    setLogsToShow(7); // Reset pagination when closing sidebar
    setEditingLogId(null); // Reset editing state
  };

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
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
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

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen font-sans text-black">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
          </motion.div>
        </div>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white min-h-screen font-sans text-black"
      >
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-start mb-4"
          >
            {/* <Header /> */}
            <div className="flex items-center gap-4 mt-4">
              {/* Enhanced Add Task Button */}{" "}
              <Button onClick={() => handleSidebarAddTask()}>
                <Plus size={16} className="mr-2" />
                Add Task
              </Button>
              <Button variant="outline" onClick={handleSidebarAddCategory}>
                <Plus size={16} className="mr-2" />
                Create Category
              </Button>
              {isNewUser && (
                <Button
                  variant="success"
                  onClick={handleSaveInitialTasks}
                  loading={false}
                >
                  Save My Strides
                </Button>
              )}
            </div>
          </motion.div>
          {/* Main Content Area with Flex Layout */}
          <div className="flex gap-8">
            {/* Main Tasks Content */}
            <div className="flex-1">
              {/* Week Navigation Header */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Previous Week"
                  >
                    <CaretLeft size={20} className="text-gray-600" />
                  </button>

                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {formatWeekRange(weekData)}
                    </h2>
                    <button
                      onClick={goToCurrentWeek}
                      className="text-sm text-black hover:text-gray-600 transition-colors mt-1"
                    >
                      Go to Current Week
                    </button>
                  </div>

                  <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Next Week"
                  >
                    <CaretRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </motion.div>

              {/* Tasks Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isNewUser && (
                  <div
                    className="bg-white border-l-4 border-black text-black p-4 mb-6 rounded-md"
                    role="alert"
                  >
                    <p className="font-bold">Welcome to Strides!</p>
                    <p>
                      Every great journey begins with a single step. We've
                      prepared some examples to get you started. Customize them
                      to match your goals, then click "Save My Strides" to begin
                      building the life you envision.
                    </p>
                  </div>
                )}
                {userTasks?.categories.map((category) => (
                  <TaskList
                    key={category.name}
                    isNewUser={isNewUser}
                    category={category.name}
                    tasks={category.tasks}
                    weekDays={weekData.map((date) => ({
                      day: date.toLocaleDateString("en-US", {
                        weekday: "short",
                      }),
                      date: date.getDate(),
                      isToday:
                        date.toDateString() === new Date().toDateString(),
                    }))}
                    weekDates={weekData.map((date) => ({
                      fullDate: `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                      ).padStart(2, "0")}-${String(date.getDate()).padStart(
                        2,
                        "0"
                      )}`,
                      isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
                    }))}
                    isOpen={openCategory === category.name}
                    onHeaderClick={() =>
                      handleCategoryHeaderClick(category.name)
                    }
                    onToggleTask={handleToggleTask}
                    onOpenAddTaskSidebar={handleSidebarAddTask}
                    onEditCategory={handleEditCategory}
                    onEditTask={(categoryName: string, taskId: number) => {
                      const task = userTasks?.categories
                        .find((c) => c.name === categoryName)
                        ?.tasks.find((t) => t.id === taskId);
                      if (task) handleSidebarEditNotes(task);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onDeleteCategory={handleDeleteCategory}
                    onOpenLog={(task) => handleSidebarEditLogs(task)}
                  />
                ))}
              </motion.div>
            </div>

            {/* Sidebar Column - Show when any mode is active */}
            {sidebarMode && sidebarMode !== "calendar" && (
              <div className="w-80">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  {sidebarMode === "edit-notes" && sidebarEditingTask && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Edit Notes
                        </h3>
                        <button
                          onClick={handleCloseSidebar}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Task: {sidebarEditingTask.text}
                          </p>
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add notes about this task..."
                            className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveNotes}
                            className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Save Notes
                          </button>
                          <button
                            onClick={handleCloseSidebar}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {sidebarMode === "edit-logs" && sidebarEditingTask && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Add Log
                        </h3>
                        <button
                          onClick={handleCloseSidebar}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            Task: {sidebarEditingTask.text}
                          </p>
                          <input
                            type="date"
                            value={selectedLogDate}
                            onChange={(e) => setSelectedLogDate(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-3"
                          />
                          <textarea
                            value={tempLogNote}
                            onChange={(e) => setTempLogNote(e.target.value)}
                            placeholder="What did you accomplish today?"
                            className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSaveTaskLog(
                                sidebarEditingTask.id,
                                tempLogNote
                              )
                            }
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            {editingLogId ? "Update Log" : "Save Log"}
                          </button>
                          {editingLogId && (
                            <button
                              onClick={() => {
                                setEditingLogId(null);
                                setTempLogNote("");
                                setSelectedLogDate(
                                  new Date().toISOString().split("T")[0]
                                );
                              }}
                              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            onClick={handleCloseSidebar}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Previous Logs Section */}
                        {sidebarEditingTask.daily_logs &&
                          sidebarEditingTask.daily_logs.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h4 className="text-md font-semibold text-gray-800 mb-3">
                                Previous Logs
                              </h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {sidebarEditingTask.daily_logs
                                  .sort(
                                    (
                                      a: {
                                        date: string;
                                        note: string;
                                        created_at?: string;
                                      },
                                      b: {
                                        date: string;
                                        note: string;
                                        created_at?: string;
                                      }
                                    ) => {
                                      // Sort by created_at if available, otherwise by date
                                      const dateA = a.created_at
                                        ? new Date(a.created_at)
                                        : new Date(a.date);
                                      const dateB = b.created_at
                                        ? new Date(b.created_at)
                                        : new Date(b.date);
                                      return dateB.getTime() - dateA.getTime(); // Newest first
                                    }
                                  )
                                  .slice(0, logsToShow)
                                  .map(
                                    (
                                      log: {
                                        date: string;
                                        note: string;
                                        created_at?: string;
                                      },
                                      index: number
                                    ) => (
                                      <div
                                        key={index}
                                        className="p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="text-sm font-medium text-gray-600">
                                                {new Date(
                                                  log.date
                                                ).toLocaleDateString()}
                                              </p>
                                              {log.created_at && (
                                                <p className="text-xs text-gray-500">
                                                  {new Date(
                                                    log.created_at
                                                  ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </p>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-800">
                                              {log.note}
                                            </p>
                                          </div>
                                          <div className="flex gap-1 ml-2">
                                            <button
                                              onClick={() => {
                                                setSelectedLogDate(log.date);
                                                setTempLogNote(log.note);
                                                setEditingLogId(
                                                  log.created_at || log.date
                                                );
                                              }}
                                              className="text-black hover:text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                              title="Edit log"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (
                                                  window.confirm(
                                                    "Are you sure you want to delete this log?"
                                                  )
                                                ) {
                                                  // Use created_at as unique identifier, fallback to date if not available
                                                  const logId =
                                                    log.created_at || log.date;
                                                  handleDeleteTaskLog(
                                                    sidebarEditingTask.id,
                                                    logId
                                                  );
                                                }
                                              }}
                                              className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50 transition-colors"
                                              title="Delete log"
                                            >
                                              <Trash size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}

                                {/* Show More Button */}
                                {sidebarEditingTask.daily_logs.length >
                                  logsToShow && (
                                  <button
                                    onClick={() =>
                                      setLogsToShow((prev) => prev + 7)
                                    }
                                    className="w-full mt-3 py-2 px-4 text-sm text-black hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                                  >
                                    Show More (
                                    {sidebarEditingTask.daily_logs.length -
                                      logsToShow}{" "}
                                    more logs)
                                  </button>
                                )}

                                {/* Show Less Button when showing more than 7 */}
                                {logsToShow > 7 && (
                                  <button
                                    onClick={() => setLogsToShow(7)}
                                    className="w-full mt-2 py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                                  >
                                    Show Less
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </>
                  )}

                  {sidebarMode === "add-task" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Add New Task
                        </h3>
                        <button
                          onClick={handleCloseSidebar}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <AddTaskForm
                          categories={[
                            DEFAULT_CATEGORY,
                            ...(userTasks?.categories.map((c) => c.name) || []),
                          ].filter(
                            (cat, index, arr) => arr.indexOf(cat) === index
                          )} // Remove duplicates
                          defaultCategory={
                            selectedCategoryForAddTask || DEFAULT_CATEGORY
                          }
                          onAddTask={(taskData, categoryName) => {
                            handleAddTask(categoryName, taskData);
                            toast.success(`Task added to ${categoryName}!`);
                            handleCloseSidebar();
                          }}
                          onClose={handleCloseSidebar}
                        />
                      </div>
                    </>
                  )}

                  {sidebarMode === "add-category" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Create New Category
                        </h3>
                        <button
                          onClick={handleCloseSidebar}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <AddCategoryForm
                          onAddCategory={(categoryName) => {
                            handleAddCategory(categoryName);
                            toast.success(
                              `Category "${categoryName}" created!`
                            );
                            handleCloseSidebar();
                          }}
                          onClose={handleCloseSidebar}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>{" "}
          {/* Close flex gap-8 */}
        </div>{" "}
        {/* Close main container */}
      </motion.div>
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
