from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from models.user_models import PyObjectId


class Transaction(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str
    accountId: str
    type: Literal["expense", "income", "transfer"]
    amount: float
    date: datetime = Field(default_factory=datetime.now)
    categoryId: str  # Changed from category
    subCategoryId: Optional[str] = None  # New field
    notes: Optional[str] = None
    # For transfers, this will point to the destination account
    toAccountId: Optional[str] = None


class CreateTransaction(BaseModel):
    accountId: str
    type: Literal["expense", "income"]  # We'll handle 'transfer' separately for now
    amount: float
    categoryId: str
    subCategoryId: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class UpdateTransaction(BaseModel):
    # All fields are optional for an update
    amount: Optional[float] = None
    categoryId: Optional[str] = None
    subCategoryId: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None
