// This new interface will define our history objects
export interface TaskHistory {
  date: string; // Stored in "YYYY-MM-DD" format
  completed: boolean;
}

// Add this new interface
export interface DailyLog {
  date: string;
  note: string;
}

// Matches the Task model in FastAPI
export interface Task {
  id: number;
  text: string;
  history: TaskHistory[]; // <-- The history is now an array of these objects
  move_history?: MoveHistory[];
  daily_logs?: DailyLog[];
  frequency?: string;
  prescription?: boolean;
  notes?: string;
}

// Matches the Category model in FastAPI
export interface Category {
  name: string;
  tasks: Task[];
}

// This is the main data structure for our tasks state
export interface UserTasks {
  id?: string; // <-- FIX: Make the document ID optional
  owner_id: string;
  categories: Category[];
}

// For creating a new user (from auth flow)
export interface UserCreate {
  email: string;
  password: string;
}

export interface MoveHistory {
  category_name: string;
  moved_at: string;
}
