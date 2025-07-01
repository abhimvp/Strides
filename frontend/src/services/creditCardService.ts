import api from "./api";
import type { CreditCardAnalysis, CreditCardPaymentSuggestion } from "../types";

/**
 * Service for credit card analysis and payment suggestions
 */

export const getCreditCardAnalysis = async (
  accountId: string
): Promise<CreditCardAnalysis> => {
  const response = await api.get(`/accounts/${accountId}/credit-analysis`);
  return response.data;
};

export const getPaymentSuggestions = async (
  accountId: string,
  availableBudget?: number
): Promise<CreditCardPaymentSuggestion> => {
  const params = availableBudget ? { available_budget: availableBudget } : {};
  const response = await api.get(`/accounts/${accountId}/payment-suggestions`, {
    params,
  });
  return response.data;
};

/**
 * Calculate credit utilization percentage
 */
export const calculateCreditUtilization = (
  balance: number,
  creditLimit: number
): number => {
  if (creditLimit <= 0) return 0;
  return Math.round((balance / creditLimit) * 100);
};

/**
 * Get credit utilization status and color
 */
export const getCreditUtilizationStatus = (utilization: number) => {
  if (utilization >= 90) {
    return { status: "Critical", color: "text-red-500", bgColor: "bg-red-100" };
  } else if (utilization >= 70) {
    return {
      status: "High",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    };
  } else if (utilization >= 30) {
    return {
      status: "Moderate",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    };
  } else {
    return { status: "Good", color: "text-green-500", bgColor: "bg-green-100" };
  }
};

/**
 * Format currency with appropriate symbol
 */
export const formatCurrency = (
  amount: number,
  currency: "INR" | "USD"
): string => {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Calculate days until due date
 */
export const calculateDaysUntilDue = (
  dueDateString?: string
): number | null => {
  if (!dueDateString) return null;

  const dueDate = new Date(dueDateString);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Determine payment urgency level based on due date and overdue status
 */
export const getPaymentUrgencyLevel = (
  daysUntilDue: number | undefined,
  isOverdue: boolean | undefined
): "high" | "medium" | "low" | "none" => {
  if (isOverdue) return "high";
  if (daysUntilDue === undefined || daysUntilDue === null) return "none";
  if (daysUntilDue <= 3) return "high";
  if (daysUntilDue <= 7) return "medium";
  return "low";
};

/**
 * Get payment urgency styling
 */
export const getPaymentUrgencyStyling = (
  urgency: "low" | "medium" | "high" | "none"
) => {
  switch (urgency) {
    case "high":
      return {
        style: "bg-red-800 border border-red-600",
        icon: "🚨",
      };
    case "medium":
      return {
        style: "bg-orange-800 border border-orange-600",
        icon: "⚠️",
      };
    case "low":
      return {
        style: "bg-green-800 border border-green-600",
        icon: "✅",
      };
    default:
      return {
        style: "bg-gray-700 border border-gray-500",
        icon: "ℹ️",
      };
  }
};
