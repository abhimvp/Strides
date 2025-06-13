"""Task Models: This module defines the data models for tasks and categories in our application."""

from typing import List, Optional
from pydantic import BaseModel, Field
from models.user_models import PyObjectId


# Add this new model
class TaskHistory(BaseModel):
    date: str
    completed: bool


class Task(BaseModel):
    """Task: Represents a single to-do item, just like in our frontend"""

    id: int
    text: str
    history: List[TaskHistory]
    frequency: Optional[str] = None
    prescription: Optional[bool] = None
    notes: Optional[str] = None


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
