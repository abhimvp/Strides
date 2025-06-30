// Helper to format a Date object into "YYYY-MM-DD" string
export const toISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getWeekDays = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const week: {
    day: string;
    date: number;
    fullDate: string;
    isToday: boolean;
    isPast: boolean;
  }[] = [];
  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const todayDateString = toISODateString(today);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + i);

    const fullDateString = toISODateString(date);

    week.push({
      day: dayLabels[i],
      date: date.getDate(),
      fullDate: fullDateString,
      isToday: fullDateString === todayDateString,
      isPast: date < today && fullDateString !== todayDateString,
    });
  }
  return week;
};

// Helper to calculate time difference in a human-readable format
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
};

// Helper to calculate days between two dates
export const getDaysBetween = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

// Generate status message for todo items
export const getTodoStatusMessage = (todo: {
  status: string;
  createdAt: string;
  inProgressAt?: string;
  completedAt?: string;
}): string => {
  const { status, createdAt, inProgressAt, completedAt } = todo;

  // Handle missing createdAt (for migrated/old data)
  if (!createdAt) {
    return "Created (legacy item)";
  }

  switch (status) {
    case "Not Started": {
      return `Created ${getTimeAgo(createdAt)}`;
    }

    case "In Progress": {
      // Use inProgressAt if available, otherwise fall back to createdAt
      const progressDate = inProgressAt || createdAt;
      const message = inProgressAt
        ? `In progress since ${getTimeAgo(progressDate)}`
        : `In progress (started ${getTimeAgo(createdAt)})`;
      return message;
    }

    case "Done": {
      if (completedAt && createdAt) {
        const timeToComplete = getDaysBetween(createdAt, completedAt);
        return `Done in ${timeToComplete} day${
          timeToComplete !== 1 ? "s" : ""
        }`;
      } else if (completedAt) {
        return `Completed ${getTimeAgo(completedAt)}`;
      } else {
        // No completion timestamp available
        return `Done (created ${getTimeAgo(createdAt)})`;
      }
    }

    default: {
      return `Created ${getTimeAgo(createdAt)}`;
    }
  }
};
