"""Task Models: This module defines the data models for tasks and categories in our application."""

from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator
from models.user_models import PyObjectId


class MoveHistory(BaseModel):
    category_name: str
    moved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Add this new model
class TaskHistory(BaseModel):
    date: str
    completed: bool


# Add this new model for a single log entry
class DailyLog(BaseModel):
    date: str  # Date in YYYY-MM-DD format
    note: str
    created_at: Optional[str] = None  # ISO string timestamp

    @field_validator("date", mode="before")
    @classmethod
    def convert_date_to_string(cls, v):
        """Convert datetime objects to date strings for backward compatibility"""
        if isinstance(v, datetime):
            return v.strftime("%Y-%m-%d")
        elif isinstance(v, str):
            # If it's already a string, extract just the date part if it contains time
            return v.split("T")[0] if "T" in v else v
        return v


class Task(BaseModel):
    """Task: Represents a single to-do item, just like in our frontend"""

    id: int
    text: str
    history: List[TaskHistory]
    move_history: List[MoveHistory] = []
    daily_logs: List[DailyLog] = []
    frequency: Optional[str] = None
    prescription: Optional[bool] = None
    notes: Optional[str] = None  # <-- The newly added optional field


class Category(BaseModel):
    """Category: A category that has a name and contains a list of Task items."""

    name: str
    tasks: List[Task]


class UserTasks(BaseModel):
    """
    UserTasks: This is the main model.
    It represents the entire document we will store in a new tasks collection in MongoDB.
    It links a list of categories to a specific owner_id
    """

    # FIX: Make the id optional with a default of None
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str
    categories: List[Category]


class UserTasksCreate(BaseModel):
    """UserTasksCreate: The data we'll use when a new user saves their initial set of tasks."""

    owner_id: str
    categories: List[Category]
