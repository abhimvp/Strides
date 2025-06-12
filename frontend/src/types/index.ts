export interface Task {
  id: number;
  text: string;
  history: boolean[];
  frequency?: string;
  prescription?: boolean;
  notes?: string;
}

export interface TasksByCategory {
  [category: string]: Task[];
}
