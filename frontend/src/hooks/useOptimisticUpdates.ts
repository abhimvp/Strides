import { useState, useCallback } from "react";
import type { Transaction, Account, ExpenseCategory } from "../types";

export const useOptimisticTransactions = (
  initialTransactions: Transaction[]
) => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [optimisticTransactions, setOptimisticTransactions] = useState<
    Transaction[]
  >([]);

  const addOptimisticTransaction = useCallback((transaction: Transaction) => {
    setOptimisticTransactions((prev) => [transaction, ...prev]);
  }, []);

  const removeOptimisticTransaction = useCallback((transactionId: string) => {
    setOptimisticTransactions((prev) =>
      prev.filter((t) => t.id !== transactionId)
    );
  }, []);

  const updateTransactionsList = useCallback(
    (newTransactions: Transaction[]) => {
      setTransactions(newTransactions);
      setOptimisticTransactions([]); // Clear optimistic updates when real data comes in
    },
    []
  );

  const optimisticDeleteTransaction = useCallback((transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  }, []);

  const rollbackDeleteTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const allTransactions = [...optimisticTransactions, ...transactions];

  return {
    transactions: allTransactions,
    addOptimisticTransaction,
    removeOptimisticTransaction,
    updateTransactionsList,
    optimisticDeleteTransaction,
    rollbackDeleteTransaction,
  };
};

export const useOptimisticAccounts = (initialAccounts: Account[]) => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [optimisticAccounts, setOptimisticAccounts] = useState<Account[]>([]);

  const addOptimisticAccount = useCallback((account: Account) => {
    setOptimisticAccounts((prev) => [...prev, account]);
  }, []);

  const removeOptimisticAccount = useCallback((accountId: string) => {
    setOptimisticAccounts((prev) => prev.filter((a) => a.id !== accountId));
  }, []);

  const updateAccountsList = useCallback((newAccounts: Account[]) => {
    setAccounts(newAccounts);
    setOptimisticAccounts([]); // Clear optimistic updates when real data comes in
  }, []);

  const updateAccountBalance = useCallback(
    (accountId: string, newBalance: number) => {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId
            ? { ...account, balance: newBalance }
            : account
        )
      );
    },
    []
  );

  const allAccounts = [...accounts, ...optimisticAccounts];

  return {
    accounts: allAccounts,
    addOptimisticAccount,
    removeOptimisticAccount,
    updateAccountsList,
    updateAccountBalance,
  };
};

export const useOptimisticCategories = (
  initialCategories: ExpenseCategory[]
) => {
  const [categories, setCategories] =
    useState<ExpenseCategory[]>(initialCategories);

  const updateCategoriesList = useCallback(
    (newCategories: ExpenseCategory[]) => {
      setCategories(newCategories);
    },
    []
  );

  return {
    categories,
    updateCategoriesList,
  };
};
