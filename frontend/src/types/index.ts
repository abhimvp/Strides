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

//  Account Management Interfaces

/**
 * Represents a payment method linked to a financial account.
 * e.g., A UPI app linked to a bank account.
 */
export interface LinkedPaymentMode {
  name: string; // e.g., "Google Pay", "PhonePe"
  type: string; // e.g., "UPI", "Net Banking"
}

/**
 * Represents a financial account held by the user.
 * This is the main model for bank accounts, credit cards, etc.
 */
export interface Account {
  id: string;
  userId: string;
  provider: string; // The bank or company (e.g., "ICICI Bank", "Chase")
  accountType: "bank_account" | "credit_card" | "e_wallet" | "cash"; // The high-level category
  accountName: string; // The user-defined name (e.g., "Salary Account", "Sapphire Card")
  balance: number;
  creditLimit?: number; // New optional field
  country: "IN" | "US";
  currency: "INR" | "USD";
  linkedModes: LinkedPaymentMode[]; // An array of linked payment methods
}

/**
 * Defines the data required to create a new Account.
 */
export interface CreateAccountData {
  provider: string;
  accountType: "bank_account" | "credit_card" | "e_wallet" | "cash";
  accountName: string;
  balance: number;
  creditLimit?: number; // New optional field
  country: "IN" | "US";
  currency: "INR" | "USD";
  linkedModes: LinkedPaymentMode[];
}

/**
 * Defines the data for updating an existing Account. All fields are optional.
 */
export interface UpdateAccountData extends Partial<CreateAccountData> {}

// --- NEW: Category and Transaction Interfaces ---

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  subcategories: SubCategory[];
}

export interface CreateCategoryData {
  name: string;
}

export interface CreateSubCategoryData {
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  date: string; // Comes as ISO string from backend
  categoryId: string;
  subCategoryId?: string;
  notes?: string;
  toAccountId?: string;
  // Transfer-specific fields
  exchangeRate?: number; // For international transfers
  commission?: number; // Commission/fee amount
  serviceName?: string; // Third-party service provider name
  transferredAmount?: number; // Final amount received after conversion and fees
  transferDirection?: "out" | "in"; // New field to distinguish transfer direction
}

export interface CreateTransactionData {
  accountId: string;
  type: "expense" | "income";
  amount: number;
  categoryId: string;
  subCategoryId?: string;
  notes?: string;
  date?: string;
}

export interface CreateTransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  exchangeRate?: number; // For international transfers
  commission?: number; // Commission/fee amount
  serviceName?: string; // Third-party service provider name
  notes?: string;
  date?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  categoryId?: string;
  subCategoryId?: string;
  notes?: string;
  date?: string;
}

// --- Add the new To-Do types below ---

export type TodoStatus = "Not Started" | "In Progress" | "Done";

export interface TodoLog {
  id: string;
  timestamp: string;
  notes: string;
}

export interface TodoItem {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  status: TodoStatus;
  createdAt: string;
  logs: TodoLog[];
}

export interface CreateTodoData {
  title: string;
  notes?: string;
}

export interface UpdateTodoData {
  title?: string;
  notes?: string;
  status?: TodoStatus;
}

export interface CreateTodoLogData {
  notes: string;
}

// --- Add the new generic types below ---

export interface LogEntry {
  date: string;
  note: string;
}

export interface LoggableItem {
  id: string;
  title: string;
  logs: LogEntry[];
}
