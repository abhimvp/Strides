# This module defines the data models for managing financial transactions, accounts, and categories.
from typing import List, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from models.user_models import PyObjectId

# A new base class with common fields
class AccountBase(BaseModel):
    name: str  # e.g., "ICICI Bank Savings", "HDFC Credit Card", "Cash"
    type: str  # e.g., "Bank Account", "Credit Card", "Cash", "E-Wallet"
    balance: float = 0.0
    currency: str = "INR"

# Model for CREATING an account (the request body)
# Notice it does NOT have owner_id or id
class AccountCreate(AccountBase):
    pass

# Model representing an account IN THE DATABASE (the response body)
class Account(AccountBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str


# Model for expense/income categories, allowing for sub-categories
class ExpenseCategory(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str
    name: str  # e.g., "Food & Dining", "Shopping", "Street Food"
    parent_id: Optional[str] = None  # To link to a parent category for sub-categories


# This is the core model for a single financial transaction
class Transaction(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str
    type: Literal["expense", "income", "transfer"]
    amount: float
    currency: str = "INR"
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Fields for all types
    notes: Optional[str] = Field(None, max_length=500)

    # Fields for Expense or Income
    category_id: Optional[str] = None  # Links to ExpenseCategory
    account_id: Optional[str] = None  # Links to the Account used

    # Fields specific to Transfer
    from_account_id: Optional[str] = None  # Source account for transfer
    to_account_id: Optional[str] = None  # Destination account for transfer

    # To store links/IDs of uploaded invoices or receipts
    attachments: List[str] = []
