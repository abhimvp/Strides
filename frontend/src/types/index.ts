// Matches the Task model in FastAPI
export interface Task {
  id: number;
  text: string;
  history: boolean[];
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
