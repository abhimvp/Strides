import React, { useState, useEffect } from "react";
import { createAccount, updateAccount } from "../../services/accountService";
import type {
  LinkedPaymentMode,
  CreateAccountData,
  Account,
  UpdateAccountData,
} from "../../types";

interface AccountFormProps {
  onSave: () => void; // Generic save handler
  onAccountCreated?: (account: Account) => void; // New callback for optimistic updates
  onCancel?: () => void; // To cancel editing
  // onAccountAdded: () => void;
  accountToEdit?: Account | null;
}

const providers = [
  "ICICI Bank",
  "HDFC Bank",
  "State Bank of India",
  "Chase",
  "BOFA",
  "American Express",
  "Discover",
  "PayPal",
  "Cash",
];

export const AccountForm = ({
  onSave,
  onAccountCreated,
  onCancel,
  accountToEdit,
}: AccountFormProps) => {
  const [provider, setProvider] = useState(providers[0]);
  const [accountType, setAccountType] = useState<
    "bank_account" | "credit_card" | "e_wallet" | "cash"
  >("bank_account");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState(""); // New state for credit limit
  const [country, setCountry] = useState<"IN" | "US">("IN"); // New state for country
  const [linkedModes, setLinkedModes] = useState<LinkedPaymentMode[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!accountToEdit;

  useEffect(() => {
    if (isEditMode && accountToEdit) {
      setProvider(accountToEdit.provider);
      setAccountType(accountToEdit.accountType);
      setAccountName(accountToEdit.accountName);
      setBalance(String(accountToEdit.balance));
      setCreditLimit(String(accountToEdit.creditLimit || ""));
      setCountry(accountToEdit.country);
      setLinkedModes(accountToEdit.linkedModes || []);
    }
  }, [accountToEdit, isEditMode]);

  const resetForm = () => {
    setProvider(providers[0]);
    setAccountType("bank_account");
    setAccountName("");
    setBalance("");
    setCreditLimit("");
    setCountry("IN");
    setLinkedModes([]);
  };

  const handleAddLinkedMode = () => {
    setLinkedModes([...linkedModes, { name: "", type: "UPI" }]);
  };

  const handleLinkedModeChange = (
    index: number,
    field: keyof LinkedPaymentMode,
    value: string
  ) => {
    const newModes = [...linkedModes];
    newModes[index][field] = value;
    setLinkedModes(newModes);
  };

  const handleRemoveLinkedMode = (index: number) => {
    setLinkedModes(linkedModes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!accountName) {
    //   setError("Please provide a name for the account.");
    //   return;
    // }
    setError("");
    setIsSubmitting(true);

    const currency = country === "IN" ? "INR" : "USD"; // Derive currency from country

    const dataPayload: CreateAccountData | UpdateAccountData = {
      provider,
      accountType,
      accountName,
      balance: parseFloat(balance) || 0,
      creditLimit:
        accountType === "credit_card"
          ? parseFloat(creditLimit) || undefined
          : undefined,
      country,
      currency,
      linkedModes: linkedModes.filter((mode) => mode.name),
    };

    try {
      if (isEditMode && accountToEdit) {
        // Add a check to ensure the ID exists before making the API call.
        if (!accountToEdit.id) {
          setError("Could not update account: Missing account ID.");
          setIsSubmitting(false);
          return;
        }
        const updatedAccount = await updateAccount(
          accountToEdit.id,
          dataPayload
        );
        if (onAccountCreated) {
          onAccountCreated(updatedAccount);
        }
      } else {
        const newAccount = await createAccount(
          dataPayload as CreateAccountData
        );
        if (onAccountCreated) {
          onAccountCreated(newAccount);
        }
        resetForm();
      }
      onSave(); // Notify parent to refresh list and close form
    } catch (err) {
      setError(
        `Failed to ${
          isEditMode ? "update" : "create"
        } account. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-800 rounded-lg shadow-md mb-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">
        {isEditMode ? "Edit Account" : "Add New Account"}
      </h3>
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as any)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="bank_account">Bank Account</option>
          <option value="credit_card">Credit Card</option>
          <option value="e_wallet">E-Wallet</option>
          <option value="cash">Cash</option>
        </select>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as "IN" | "US")}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="IN">India (INR)</option>
          <option value="US">USA (USD)</option>
        </select>

        <input
          type="text"
          placeholder="Account Name (e.g., Salary Account)"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        />
        <input
          type="number"
          placeholder="Initial Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      {/* Conditionally render Credit Limit field */}
      {accountType === "credit_card" && (
        <input
          type="number"
          placeholder="Credit Limit"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      )}

      <div>
        <h4 className="text-md font-semibold text-white mb-2">
          Linked Payment Modes (Optional)
        </h4>
        {linkedModes.map((mode, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Name (e.g., Google Pay)"
              value={mode.name}
              onChange={(e) =>
                handleLinkedModeChange(index, "name", e.target.value)
              }
              className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <input
              type="text"
              placeholder="Type (e.g., UPI)"
              value={mode.type}
              onChange={(e) =>
                handleLinkedModeChange(index, "type", e.target.value)
              }
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <button
              type="button"
              onClick={() => handleRemoveLinkedMode(index)}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-3 rounded"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddLinkedMode}
          className="w-full text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          + Add Payment Mode
        </button>
      </div>

      <div className="flex gap-4">
        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Account"
            : "Add Account"}
        </button>
      </div>
    </form>
  );
};
