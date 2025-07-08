import { useState, useCallback } from "react";
import { getAccounts } from "../services/accountService";
import { getCategories } from "../services/categoryService";
import { getTransactions } from "../services/transactionService";
import type { Account, ExpenseCategory, Transaction } from "../types";

export const useSelectiveDataFetching = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    accounts?: string;
    categories?: string;
    transactions?: string;
  }>({});

  const fetchAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, accounts: undefined }));
      const accounts = await getAccounts();
      return accounts;
    } catch (error) {
      const errorMessage = "Failed to fetch accounts";
      setErrors((prev) => ({ ...prev, accounts: errorMessage }));
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (): Promise<ExpenseCategory[]> => {
    try {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, categories: undefined }));
      const categories = await getCategories();
      return categories;
    } catch (error) {
      const errorMessage = "Failed to fetch categories";
      setErrors((prev) => ({ ...prev, categories: errorMessage }));
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, transactions: undefined }));
      const transactions = await getTransactions();
      return transactions;
    } catch (error) {
      const errorMessage = "Failed to fetch transactions";
      setErrors((prev) => ({ ...prev, transactions: errorMessage }));
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchAccounts = useCallback(
    async (updateCallback: (accounts: Account[]) => void) => {
      try {
        const accounts = await fetchAccounts();
        updateCallback(accounts);
      } catch (error) {
        console.error("Failed to refetch accounts:", error);
      }
    },
    [fetchAccounts]
  );

  const refetchCategories = useCallback(
    async (updateCallback: (categories: ExpenseCategory[]) => void) => {
      try {
        const categories = await fetchCategories();
        updateCallback(categories);
      } catch (error) {
        console.error("Failed to refetch categories:", error);
      }
    },
    [fetchCategories]
  );

  const refetchTransactions = useCallback(
    async (updateCallback: (transactions: Transaction[]) => void) => {
      try {
        const transactions = await fetchTransactions();
        updateCallback(transactions);
      } catch (error) {
        console.error("Failed to refetch transactions:", error);
      }
    },
    [fetchTransactions]
  );

  return {
    isLoading,
    errors,
    fetchAccounts,
    fetchCategories,
    fetchTransactions,
    refetchAccounts,
    refetchCategories,
    refetchTransactions,
  };
};
