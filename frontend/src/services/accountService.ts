import api from "./api";

import type { Account, CreateAccountData, UpdateAccountData } from "../types";

/**
 * Fetches all accounts for the logged-in user.
 */
export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get("/accounts");
  // The API returns accounts with an "_id" field. We map over the array
  // to create a new array where each object has a standard "id" field.
  return response.data.map((account: any) => {
    const { _id, ...rest } = account;
    return { id: _id, ...rest };
  });
};

/**
 * Creates a new account.
 * @param accountData The data for the new account.
 */
export const createAccount = async (
  accountData: CreateAccountData
): Promise<Account> => {
  const response = await api.post("/accounts", accountData);
  // Also apply the transformation to the newly created account response
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};

/**
 * Updates an existing account.
 * @param accountId The ID of the account to update.
 * @param accountData The data to update.
 */
export const updateAccount = async (accountId: string, accountData: UpdateAccountData): Promise<Account> => {
  const response = await api.put(`/accounts/${accountId}`, accountData);
  // Also apply the transformation to the updated account response
  const { _id, ...rest } = response.data;
  return { id: _id, ...rest };
};