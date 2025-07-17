// src/services/tripService.ts
import api from "./api";
import type { Trip, Participant, Transaction } from "../types/trip";

export interface CreateTripData {
  name: string;
  destinations: string[];
  start_date?: string;
  end_date?: string;
}

export interface UpdateTripData {
  name?: string;
  destinations?: string[];
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface ParticipantData {
  id?: string;
  name: string;
  email?: string;
  initial_contribution: number;
  payment_method?: "cash" | "phonepe" | "googlepay" | "bank_transfer" | "other";
}

export interface TransactionData {
  type:
    | "leader_expense"
    | "participant_contribution"
    | "participant_outofpocket";
  amount: number;
  description: string;
  category: string;
  paid_by: string; // 'leader' or participant_id
  participant_id?: string; // For participant contributions
  participant_data?: {
    name: string;
    email?: string;
    initial_contribution?: number;
    payment_method?: string;
  }; // For new participant creation
}

export const tripService = {
  // Get all trips
  async getAllTrips(): Promise<Trip[]> {
    console.log("Making API call to get all trips"); // Debug log
    const response = await api.get("/trips");
    console.log("API response:", response.data); // Debug log

    // Transform the data to ensure we have 'id' instead of '_id'
    const trips = response.data.map((trip: Trip & { _id?: string }) => ({
      ...trip,
      id: trip.id || trip._id, // Use id if available, otherwise use _id
      participants:
        trip.participants?.map(
          (participant: Participant & { _id?: string }) => ({
            ...participant,
            id: participant.id || participant._id,
          })
        ) || [],
      transactions:
        trip.transactions?.map(
          (transaction: Transaction & { _id?: string }) => ({
            ...transaction,
            id: transaction.id || transaction._id,
          })
        ) || [],
    }));

    return trips;
  },

  // Get a specific trip
  async getTrip(tripId: string): Promise<Trip> {
    const response = await api.get(`/trips/${tripId}`);
    const trip = response.data;

    // Transform the data to ensure we have 'id' instead of '_id'
    return {
      ...trip,
      id: trip.id || trip._id,
      participants:
        trip.participants?.map(
          (participant: Participant & { _id?: string }) => ({
            ...participant,
            id: participant.id || participant._id,
          })
        ) || [],
      transactions:
        trip.transactions?.map(
          (transaction: Transaction & { _id?: string }) => ({
            ...transaction,
            id: transaction.id || transaction._id,
          })
        ) || [],
    };
  },

  // Create a new trip
  async createTrip(tripData: CreateTripData): Promise<Trip> {
    const response = await api.post("/trips", tripData);
    const trip = response.data;

    // Transform the data to ensure we have 'id' instead of '_id'
    return {
      ...trip,
      id: trip.id || trip._id,
    };
  },

  // Update a trip
  async updateTrip(tripId: string, tripData: UpdateTripData): Promise<Trip> {
    const response = await api.put(`/trips/${tripId}`, tripData);
    const trip = response.data;

    // Transform the data to ensure we have 'id' instead of '_id'
    return {
      ...trip,
      id: trip.id || trip._id,
      participants:
        trip.participants?.map(
          (participant: Participant & { _id?: string }) => ({
            ...participant,
            id: participant.id || participant._id,
          })
        ) || [],
      transactions:
        trip.transactions?.map(
          (transaction: Transaction & { _id?: string }) => ({
            ...transaction,
            id: transaction.id || transaction._id,
          })
        ) || [],
    };
  },

  // Delete a trip
  async deleteTrip(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },

  // Add a participant to a trip
  async addParticipant(
    tripId: string,
    participantData: ParticipantData
  ): Promise<{ message: string; participant: ParticipantData }> {
    const response = await api.post(
      `/trips/${tripId}/participants`,
      participantData
    );
    return response.data;
  },

  // Remove a participant from a trip
  async removeParticipant(
    tripId: string,
    participantId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `/trips/${tripId}/participants/${participantId}`
    );
    return response.data;
  },

  // Update a participant
  async updateParticipant(
    tripId: string,
    participantId: string,
    participantData: Partial<ParticipantData>
  ): Promise<{ message: string; participant: ParticipantData }> {
    const response = await api.put(
      `/trips/${tripId}/participants/${participantId}`,
      participantData
    );
    return response.data;
  },

  // Add a transaction to a trip
  async addTransaction(
    tripId: string,
    transactionData: TransactionData
  ): Promise<{ message: string; transaction: TransactionData }> {
    const response = await api.post(
      `/trips/${tripId}/transactions`,
      transactionData
    );
    return response.data;
  },

  // Delete a transaction from a trip
  async deleteTransaction(
    tripId: string,
    transactionId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `/trips/${tripId}/transactions/${transactionId}`
    );
    return response.data;
  },
};
