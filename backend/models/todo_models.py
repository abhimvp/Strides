from pydantic import BaseModel, Field, field_serializer
from typing import List, Literal, Optional
from datetime import datetime,timezone
from .user_models import PyObjectId
from bson import ObjectId

# The status values for our Kanban board
TodoStatus = Literal["Not Started", "In Progress", "Done"]


class TodoLog(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: str
    
    # 2. Add this serializer to force the correct ISO format with 'Z'
    @field_serializer('timestamp')
    def serialize_timestamp(self, dt: datetime, _info):
        return dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'


class TodoItem(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    userId: str
    title: str
    notes: Optional[str] = None
    status: TodoStatus = "Not Started"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    logs: List[TodoLog] = []
    
    # 3. Add this serializer as well for the creation date
    @field_serializer('createdAt')
    def serialize_created_at(self, dt: datetime, _info):
        return dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'


class CreateTodo(BaseModel):
    title: str
    notes: Optional[str] = None


class UpdateTodo(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[TodoStatus] = None


class CreateTodoLog(BaseModel):
    notes: str
