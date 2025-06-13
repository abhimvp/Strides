import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { getWeekDays } from "../utils/date";
import { initialTasks } from "../data/mockTasks";
import { Header } from "../components/Header";
import { TaskList } from "../components/TaskList";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import type { UserTasks, Category, Task } from "../types";
import {
  getTasks,
  createInitialTasks,
  updateTasks,
} from "../services/taskService";
import { AddCategoryForm } from "../components/AddCategoryForm";

export const Dashboard = () => {
  const [userTasks, setUserTasks] = useState<UserTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // New state for category modal
  const weekDays = getWeekDays();
  //   console.log("Week Days:", weekDays); // Debugging line
  const { logout } = useAuth();

  // Fetch user's tasks when the component mounts
  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const data = await getTasks();
        if (data.categories.length === 0 && !data.id) {
          // This is a new user, load the mock data for them to customize
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
        // Handle error, maybe show a message to the user
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

  const handleToggleTask = async (
    categoryName: string,
    taskId: number,
    dayIndex: number
  ) => {
    if (!userTasks) return;

    // Create a deep copy to avoid direct state mutation
    const newCategories = JSON.parse(JSON.stringify(userTasks.categories));

    // Find the task and toggle its history
    const category = newCategories.find(
      (c: Category) => c.name === categoryName
    );
    if (category) {
      const task = category.tasks.find((t: any) => t.id === taskId);
      if (task) {
        task.history[dayIndex] = !task.history[dayIndex];
      }
    }

    updateAndSaveChanges(newCategories);
  };

  const updateAndSaveChanges = async (newCategories: Category[]) => {
    // Optimistically update UI
    setUserTasks((prev) =>
      prev ? { ...prev, categories: newCategories } : null
    );

    // Only save to backend if the user is not in the initial setup phase
    if (!isNewUser) {
      try {
        await updateTasks(newCategories);
      } catch (error) {
        console.error("Failed to update tasks:", error);
        // Optionally revert state and show error
        alert("Failed to save changes.");
      }
    }
  };

  const handleAddCategory = (categoryName: string) => {
    if (!userTasks) return;

    // Check for duplicate category names
    const doesExist = userTasks.categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (doesExist) {
      alert("A category with this name already exists.");
      return;
    }

    const newCategory: Category = {
      name: categoryName,
      tasks: [], // New categories start with no tasks
    };

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
        id: Date.now(), // Use timestamp for a simple unique ID
        text: taskText,
        history: Array(7).fill(false),
      };
      category.tasks.push(newTask);
      updateAndSaveChanges(newCategories);
    }
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
                  className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all font-semibold"
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
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 text-lg text-slate-600 hover:text-blue-600 transition-colors py-2 px-4"
            >
              <PlusCircle size={24} />
              Create a New Category
            </button>
          </div>

          {userTasks?.categories.map((category) => (
            <TaskList
              key={category.name}
              category={category.name}
              tasks={category.tasks}
              weekDays={weekDays}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
            />
          ))}
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
    </>
  );
};
