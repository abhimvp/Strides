import type { TasksByCategory } from "../types";

export const initialTasks: TasksByCategory = {
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
