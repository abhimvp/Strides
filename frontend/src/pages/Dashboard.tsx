import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Header } from "../components/Header";
import { TaskList } from "../components/TaskList";
import { Modal } from "../components/Modal";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { initialTasks } from "../data/mockTasks";
import type { UserTasks, Category, Task, TaskHistory } from "../types";
import { getWeekDays } from "../utils/date";
import { useAuth } from "../hooks/useAuth";
import {
  getTasks,
  createInitialTasks,
  updateTasks,
} from "../services/taskService";

type DeletionInfo = {
  type: "task" | "category";
  name: string;
  id?: number;
} | null;

export const Dashboard = () => {
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo>(null);

  const weekData = getWeekDays();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const data = await getTasks();
        if (data && data.categories.length === 0 && !data.id) {
          setUserTasks({
            owner_id: data.owner_id,
            categories: initialTasks.categories,
          });
          setIsNewUser(true);
        } else {
          setUserTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserTasks();
  }, []);

  const handleSaveInitialTasks = async () => {
    if (!userTasks) return;
    try {
      const savedTasks = await createInitialTasks(userTasks.categories);
      setUserTasks(savedTasks);
      setIsNewUser(false);
      alert("Your Strides have been saved!");
    } catch (error) {
      console.error("Failed to save initial tasks:", error);
    }
  };

  const updateAndSaveChanges = async (newCategories: Category[]) => {
    setUserTasks((prev) =>
      prev ? { ...prev, categories: newCategories } : null
    );
    if (!isNewUser) {
      try {
        await updateTasks(newCategories);
      } catch (error) {
        console.error("Failed to update tasks:", error);
        alert("Failed to save changes.");
      }
    }
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
  };

  const handleAddTask = (categoryName: string, taskText: string) => {
    if (!userTasks) return;
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));
    const category = newCategories.find(
      (c: Category) => c.name === categoryName
    );

    if (category) {
      const newTask: Task = {
        id: Date.now(),
        text: taskText,
        // THE FIX: Initialize with an empty array to match the new TaskHistory[] type
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your Strides...
      </div>
    );
  }

  return (
    <>
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
                onClick={logout}
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
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
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
    </>
  );
};
