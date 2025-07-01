from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime
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
    creditLimit: Optional[float] = None  # Credit card limit
    country: Literal["IN", "US"]
    currency: str  # "INR" or "USD"
    linkedModes: List[LinkedPaymentMode] = []

    # Credit Card specific fields
    minimumPaymentDue: Optional[float] = None  # Minimum payment amount due
    paymentDueDate: Optional[datetime] = None  # When payment is due
    statementDate: Optional[datetime] = None  # Statement generation date
    lastPaymentDate: Optional[datetime] = None  # Last payment received date
    lastPaymentAmount: Optional[float] = None  # Last payment amount
    interestRate: Optional[float] = None  # APR percentage
    gracePeriodDays: Optional[int] = None  # Grace period for payments


class CreateAccount(BaseModel):
    provider: str
    accountType: Literal["bank_account", "credit_card", "e_wallet", "cash"]
    accountName: str
    balance: float = 0.0
    creditLimit: Optional[float] = None
    country: Literal["IN", "US"]
    currency: str
    linkedModes: List[LinkedPaymentMode] = []

    # Credit Card specific fields for creation
    minimumPaymentDue: Optional[float] = None
    paymentDueDate: Optional[datetime] = None
    statementDate: Optional[datetime] = None
    interestRate: Optional[float] = None
    gracePeriodDays: Optional[int] = None


class UpdateAccount(BaseModel):
    provider: Optional[str] = None
    accountType: Optional[
        Literal["bank_account", "credit_card", "e_wallet", "cash"]
    ] = None
    accountName: Optional[str] = None
    balance: Optional[float] = None
    creditLimit: Optional[float] = None
    country: Optional[Literal["IN", "US"]] = None
    currency: Optional[str] = None
    linkedModes: Optional[List[LinkedPaymentMode]] = None

    # Credit Card specific fields for updates
    minimumPaymentDue: Optional[float] = None
    paymentDueDate: Optional[datetime] = None
    statementDate: Optional[datetime] = None
    lastPaymentDate: Optional[datetime] = None
    lastPaymentAmount: Optional[float] = None
    interestRate: Optional[float] = None
    gracePeriodDays: Optional[int] = None


# Credit Card Analysis Models
class CreditCardAnalysis(BaseModel):
    """Analysis data for credit card account"""

    currentBalance: float  # Current debt
    creditLimit: float
    availableCredit: float
    creditUtilization: float  # Percentage of credit used
    minimumPaymentDue: Optional[float] = None
    paymentDueDate: Optional[datetime] = None
    daysUntilDue: Optional[int] = None
    isOverdue: bool = False
    recommendedPayment: float  # Suggested payment amount
    paymentOptions: List["PaymentOption"]


class PaymentOption(BaseModel):
    """Different payment options for credit cards"""

    type: Literal["minimum", "recommended", "full", "custom"]
    amount: float
    description: str
    impact: str  # Description of what this payment achieves


class CreditCardPaymentSuggestion(BaseModel):
    """Payment suggestions based on user's financial situation"""

    minimumDue: float
    recommendedAmount: float
    fullBalance: float
    urgency: Literal["low", "medium", "high"]
    reasoning: str
    payoffTimeline: Optional[str] = None  # Time to pay off at current rate


# Update PaymentOption forward reference
CreditCardAnalysis.model_rebuild()
