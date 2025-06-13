import type { UserTasks } from "../types";

// Note: The data is now inside a 'categories' property
export const initialTasks: Omit<UserTasks, "owner_id" | "id"> = {
  categories: [
    {
      name: "Health & Wellness",
      tasks: [
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
          history: [false, false, false, false, false, false, false],
        },
      ],
    },
    {
      name: "Professional Growth",
      tasks: [
        {
          id: 11,
          text: "DSA",
          notes: "Write down what was learned",
          history: [false, false, false, false, false, false, false],
        },
        {
          id: 14,
          text: "SQL",
          history: [false, false, false, false, false, false, false],
        },
      ],
    },
  ],
};
