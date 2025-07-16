from pydantic import BaseModel, Field, field_serializer
from typing import List, Literal, Optional
from datetime import datetime, timezone

# The status values for our Kanban board
TodoStatus = Literal["Not Started", "In Progress", "Done"]


class TodoLog(BaseModel):
    id: str  # Simple string field, no alias
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: str

    # 2. Add this serializer to force the correct ISO format with 'Z'
    @field_serializer("timestamp")
    def serialize_timestamp(self, dt: datetime, _info):
        return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class TodoItem(BaseModel):
    id: str  # Simply a string field, no ObjectId generation
    userId: str
    title: str
    notes: Optional[str] = None
    status: TodoStatus = "Not Started"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    inProgressAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    logs: List[TodoLog] = []

    # 3. Add this serializer as well for the creation date
    @field_serializer("createdAt")
    def serialize_created_at(self, dt: datetime, _info):
        return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

    # Add serializers for the new timestamp fields
    @field_serializer("inProgressAt")
    def serialize_in_progress_at(self, dt: Optional[datetime], _info):
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

    @field_serializer("completedAt")
    def serialize_completed_at(self, dt: Optional[datetime], _info):
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class CreateTodo(BaseModel):
    title: str
    notes: Optional[str] = None


class UpdateTodo(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[TodoStatus] = None
    inProgressAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None


class CreateTodoLog(BaseModel):
    notes: str
