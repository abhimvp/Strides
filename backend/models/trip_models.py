# backend/models/trip_models.py
from datetime import datetime
from typing import List, Optional, Annotated, Dict
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId


def validate_object_id(v):
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str):
        if ObjectId.is_valid(v):
            return ObjectId(v)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]


class Participant(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    email: Optional[str] = None
    initial_contribution: float = 0.0
    total_contributed: float = 0.0
    payment_method: Optional[str] = "cash"  # Default to cash for backward compatibility

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }


class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    type: str  # 'leader_expense', 'participant_contribution', 'participant_outofpocket'
    amount: float
    description: str
    category: str  # food, petrol, hotel, etc.
    date: datetime = Field(default_factory=datetime.now)
    added_by: str  # trip leader user ID
    paid_by: str  # 'leader' or participant_id
    participant_id: Optional[str] = None  # For participant-related transactions

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }


class Trip(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    name: str
    destinations: List[str]
    participants: List[Participant] = []
    transactions: List[Transaction] = []
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "planning"  # planning, active, completed
    leader_id: str  # User ID of the trip leader
    user_id: str  # User who created the trip
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }


class TripCreate(BaseModel):
    name: str
    destinations: List[str]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class TripUpdate(BaseModel):
    name: Optional[str] = None
    destinations: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None


class ParticipantCreate(BaseModel):
    name: str
    email: Optional[str] = None
    initial_contribution: float = 0.0
    payment_method: Optional[str] = "cash"


class TransactionCreate(BaseModel):
    type: str  # 'leader_expense', 'participant_contribution', 'participant_outofpocket'
    amount: float
    description: str
    category: str
    paid_by: str  # 'leader' or participant_id
    participant_id: Optional[str] = None  # For participant contributions/expenses
    participant_data: Optional[Dict] = None  # For new participant creation
