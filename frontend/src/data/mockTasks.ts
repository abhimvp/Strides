import type { UserTasks } from "../types";

export const initialTasks: Omit<UserTasks, "owner_id" | "id"> = {
  categories: [
    {
      name: "Health & Wellness",
      tasks: [
        // The history should now be an empty array by default
        { id: 1, text: "Head Bath", frequency: "every 3 days", history: [] },
        { id: 2, text: "Tablets - Morning", prescription: true, history: [] },
      ],
    },
    {
      name: "Professional Growth",
      tasks: [
        {
          id: 11,
          text: "DSA",
          notes: "Write down what was learned",
          history: [],
        },
        { id: 14, text: "SQL", history: [] },
      ],
    },
  ],
};
