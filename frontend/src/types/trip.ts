// src/types/trip.ts

export interface Participant {
  id: string;
  name: string;
  email?: string;
  initial_contribution: number;
  total_contributed: number;
  payment_method?: "cash" | "phonepe" | "googlepay" | "bank_transfer" | "other";
}

export interface Transaction {
  id: string;
  type:
    | "leader_expense"
    | "participant_contribution"
    | "participant_outofpocket";
  amount: number;
  description: string;
  category: string; // food, petrol, hotel, etc.
  date: Date;
  added_by: string; // trip leader
  paid_by: string; // 'leader' or participant_id
  participant_id?: string; // For participant contributions
}

export interface Trip {
  id: string;
  name: string;
  destinations: string[];
  participants: Participant[];
  transactions: Transaction[];
  start_date?: Date;
  end_date?: Date;
  status: "planning" | "active" | "completed";
  leader_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type TripType = "big-trips" | "small-gatherings";
