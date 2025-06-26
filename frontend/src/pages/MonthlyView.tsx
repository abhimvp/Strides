import { useState, useEffect } from "react";
import { CaretLeft, CaretRight, CaretDown } from "phosphor-react";
import { getMonthlyHistory } from "../services/taskService";
import type { UserTasks } from "../types";

interface MonthlyViewProps {
  userTasks: UserTasks | null;
}

type HistoryData = Record<number, string[]>; // Maps task.id to an array of "YYYY-MM-DD" completion dates

export const MonthlyView = ({ userTasks }: MonthlyViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [historyData, setHistoryData] = useState<HistoryData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await getMonthlyHistory(year, month);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch monthly history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userTasks) {
      fetchHistory();
      if (userTasks.categories.length > 0 && !openCategory) {
        setOpenCategory(userTasks.categories[0].name);
      }
    }
  }, [currentDate, userTasks]);

  const changeMonth = (amount: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() + amount);
      return newDate;
    });
  };

  const handleCategoryClick = (categoryName: string) => {
    setOpenCategory((prev) => (prev === categoryName ? null : categoryName));
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <CaretLeft />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <CaretRight />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center p-8 text-slate-500">
          Loading monthly progress...
        </div>
      ) : (
        <div className="space-y-2">
          {userTasks?.categories.map((category) => (
            <div key={category.name} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => handleCategoryClick(category.name)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="text-xl font-semibold text-slate-700">
                  {category.name}
                </span>
                <CaretDown
                  size={24}
                  className={`text-slate-500 transition-transform ${
                    openCategory === category.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openCategory === category.name && (
                <div className="px-4 pb-4">
                  {category.tasks.map((task) => (
                    <div key={task.id} className="py-3 border-t">
                      <p className="font-medium mb-2 text-slate-600">
                        {task.text}
                      </p>
                      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const fullDateStr = `${currentDate.getFullYear()}-${String(
                            currentDate.getMonth() + 1
                          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const isCompleted =
                            historyData[task.id]?.includes(fullDateStr);
                          return (
                            <div
                              key={day}
                              title={fullDateStr}
                              className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-mono ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {category.tasks.length === 0 && (
                    <p className="text-slate-500 px-4 pb-2">
                      No tasks in this category.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
