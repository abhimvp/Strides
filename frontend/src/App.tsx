import React, { useState } from "react";
import { Plus, Bell, Paperclip, CheckCircle, Circle } from "lucide-react";

// --- TypeScript Interfaces ---
// This defines the "shape" of a single task object.
interface Task {
  id: number;
  text: string;
  history: boolean[];
  frequency?: string;
  prescription?: boolean;
  notes?: string;
}

// This defines the structure for our entire task list, grouped by category.
interface TasksByCategory {
  [category: string]: Task[];
}

// --- Mock Data ---
// This is the initial static data for the app, matching our defined interfaces.
const initialTasks: TasksByCategory = {
  "Health & Wellness": [
    {
      id: 1,
      text: "Head Bath",
      frequency: "every 3 days",
      history: [false, false, false, false, false, false, false],
    },
    {
      id: 2,
      text: "Tablets - Morning",
      prescription: true,
      history: [true, false, false, false, false, false, false],
    },
    {
      id: 3,
      text: "Tablets - Evening",
      prescription: true,
      history: [true, false, false, false, false, false, false],
    },
    {
      id: 4,
      text: "Bath",
      history: [true, true, true, true, true, true, true],
    },
    {
      id: 5,
      text: "Walk / Gym",
      history: [false, true, false, true, false, true, false],
    },
  ],
  "Mental & Emotional Wellbeing": [
    {
      id: 6,
      text: "Talk to someone (Family/Friends)",
      history: [false, false, true, false, false, false, true],
    },
    {
      id: 7,
      text: "Clean Room / Desk",
      history: [true, false, false, true, false, false, false],
    },
    {
      id: 8,
      text: "Write down a summary of the day",
      history: [false, false, false, false, false, false, false],
    },
    {
      id: 9,
      text: "Read a book (non-work) for 30 mins",
      history: [true, true, false, true, true, false, false],
    },
  ],
  "Professional Growth": [
    {
      id: 10,
      text: "Practice communication skills",
      history: [false, false, false, false, false, false, false],
    },
    {
      id: 11,
      text: "DSA",
      notes: "Write down what was learned",
      history: [true, false, true, false, false, true, false],
    },
    {
      id: 12,
      text: "LLD",
      history: [false, true, false, false, true, false, false],
    },
    {
      id: 13,
      text: "HLD",
      history: [false, false, false, false, false, false, false],
    },
    {
      id: 14,
      text: "SQL",
      history: [true, true, false, true, false, false, false],
    },
    {
      id: 15,
      text: "Update Resume",
      history: [false, false, false, true, false, false, false],
    },
    {
      id: 16,
      text: "Learned about AI / Projects",
      history: [false, false, false, false, false, false, false],
    },
  ],
};

// --- Main App Component ---
export default function App() {
  const [tasks, setTasks] = useState<TasksByCategory>(initialTasks);

  const toggleTask = (category: string, taskId: number, dayIndex: number) => {
    // Create a deep copy to avoid direct state mutation
    const newTasks = JSON.parse(JSON.stringify(tasks));

    const taskToUpdate = newTasks[category].find(
      (task: Task) => task.id === taskId
    );
    if (taskToUpdate) {
      taskToUpdate.history[dayIndex] = !taskToUpdate.history[dayIndex];
      setTasks(newTasks);
    }
  };

  const getWeekDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const todayIndex = new Date().getDay();
    // Reorder array to have today as the last day for a 7-day lookback
    const reorderedDays = [];
    for (let i = 7; i > 0; i--) {
      reorderedDays.push(days[(todayIndex - i + 1 + 7) % 7]);
    }
    return reorderedDays;
  };
  const weekDays = getWeekDays();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Strides</h1>
          <p className="text-slate-500 mt-2">
            Your daily checkpoint for personal growth and well-being.
          </p>
        </header>

        {Object.entries(tasks).map(([category, taskList]) => (
          <section key={category} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-slate-700">
                {category}
              </h2>
              <button className="flex items-center gap-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
                <Plus size={16} />
                Add Task
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-[3fr,2fr] gap-4">
                <div className="font-bold text-slate-500 text-sm uppercase tracking-wider">
                  Task
                </div>
                <div className="grid grid-cols-7 gap-2 text-center font-bold text-slate-500 text-sm uppercase tracking-wider">
                  {weekDays.map((day, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 flex items-center justify-center"
                      title={`Day ${i + 1}`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <hr className="my-3 border-slate-200" />

              {taskList.map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[3fr,2fr] gap-4 items-center py-3 hover:bg-slate-50 rounded-lg -mx-2 px-2"
                >
                  <div className="flex flex-col">
                    <p className="font-medium">{task.text}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      {task.frequency && (
                        <span className="flex items-center gap-1">
                          <Bell size={12} /> {task.frequency}
                        </span>
                      )}
                      {task.prescription && (
                        <span className="flex items-center gap-1">
                          <Paperclip size={12} /> Attach prescription
                        </span>
                      )}
                      {task.notes && (
                        <span className="text-blue-500">{task.notes}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {task.history.map((done, i) => (
                      <button
                        key={i}
                        onClick={() => toggleTask(category, task.id, i)}
                        className="flex justify-center items-center h-8 w-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                        aria-label={`Mark task ${task.text} for day ${
                          i + 1
                        } as ${done ? "incomplete" : "complete"}`}
                      >
                        {done ? (
                          <CheckCircle className="text-green-500" size={22} />
                        ) : (
                          <Circle
                            className="text-slate-300 hover:text-slate-400"
                            size={22}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
