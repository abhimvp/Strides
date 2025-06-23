import api from "./api";

import type { Account, CreateAccountData } from "../types";

/**
 * Fetches all accounts for the logged-in user.
 */
export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get("/accounts");
  return response.data;
};

/**
 * Creates a new account.
 * @param accountData The data for the new account.
 */
export const createAccount = async (
  accountData: CreateAccountData
): Promise<Account> => {
  const response = await api.post("/accounts", accountData);
  return response.data;
};
