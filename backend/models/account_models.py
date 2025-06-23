from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from models.user_models import PyObjectId


class LinkedPaymentMode(BaseModel):
    name: str  # e.g., "Google Pay", "PhonePe"
    type: str  # e.g., "UPI", "Net Banking"


class Account(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str
    provider: str  # The bank or company (e.g., "ICICI Bank", "Chase")
    accountType: Literal["bank_account", "credit_card", "e_wallet", "cash"]
    accountName: str  # The user-defined name (e.g., "Salary Account", "Sapphire Card")
    balance: float = 0.0
    creditLimit: Optional[float] = None  # New field for credit card limit
    country: Literal["IN", "US"]
    currency: str  # "INR" or "USD"
    linkedModes: List[LinkedPaymentMode] = []


class CreateAccount(BaseModel):
    provider: str
    accountType: Literal["bank_account", "credit_card", "e_wallet", "cash"]
    accountName: str
    balance: float = 0.0
    creditLimit: Optional[float] = None  # New field
    country: Literal["IN", "US"]
    currency: str
    linkedModes: List[LinkedPaymentMode] = []


class UpdateAccount(BaseModel):
    provider: Optional[str] = None
    accountType: Optional[
        Literal["bank_account", "credit_card", "e_wallet", "cash"]
    ] = None
    accountName: Optional[str] = None
    balance: Optional[float] = None
    creditLimit: Optional[float] = None  # New field
    country: Optional[Literal["IN", "US"]] = None
    currency: Optional[str] = None
    linkedModes: Optional[List[LinkedPaymentMode]] = None
