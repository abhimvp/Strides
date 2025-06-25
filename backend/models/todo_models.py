from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
from .user_models import PyObjectId
from bson import ObjectId

# The status values for our Kanban board
TodoStatus = Literal["Not Started", "In Progress", "Done"]


class TodoLog(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    timestamp: datetime = Field(default_factory=datetime.now)
    notes: str


class TodoItem(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    userId: str
    title: str
    notes: Optional[str] = None
    status: TodoStatus = "Not Started"
    createdAt: datetime = Field(default_factory=datetime.now)
    logs: List[TodoLog] = []


class CreateTodo(BaseModel):
    title: str
    notes: Optional[str] = None


class UpdateTodo(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[TodoStatus] = None


class CreateTodoLog(BaseModel):
    notes: str
