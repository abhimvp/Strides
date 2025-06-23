import api from "./api";
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
} from "../types";

/**
 * Creates a new transaction.
 */
export const createTransaction = async (
  transactionData: CreateTransactionData
): Promise<Transaction> => {
  const response = await api.post("/transactions", transactionData);
  // Normalize the response data
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};

/**
 * Fetches all transactions for the logged-in user.
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get("/transactions");
  // Normalize the data to match frontend conventions (_id -> id)
  return response.data.map((transaction: any) => {
    const { _id, ...rest } = transaction;
    return { id: _id, ...rest };
  });
};

/**
 * Updates an existing transaction.
 */
export const updateTransaction = async (
  transactionId: string,
  transactionData: UpdateTransactionData
): Promise<Transaction> => {
  const response = await api.put(
    `/transactions/${transactionId}`,
    transactionData
  );
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};

/**
 * Deletes a transaction.
 */
export const deleteTransaction = async (
  transactionId: string
): Promise<void> => {
  await api.delete(`/transactions/${transactionId}`);
};
