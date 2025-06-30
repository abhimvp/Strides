from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List

from utils.database import get_database
from utils.security import get_current_user
from models.todo_models import (
    TodoItem,
    CreateTodo,
    UpdateTodo,
    CreateTodoLog,
)

router = APIRouter()


def todo_from_db(doc: dict) -> TodoItem:
    """Convert MongoDB document to TodoItem model"""
    if doc is None:
        raise ValueError("Document cannot be None")

    # Convert _id to id for the model
    doc_copy = doc.copy()
    doc_copy["id"] = str(doc_copy.pop("_id"))

    # Handle missing createdAt for existing todos (migration fallback)
    if "createdAt" not in doc_copy or doc_copy["createdAt"] is None:
        # Use ObjectId creation time as fallback
        object_id = ObjectId(doc_copy["id"])
        doc_copy["createdAt"] = object_id.generation_time

        # Log this for monitoring
        print(
            f"Warning: Todo {doc_copy.get('title', 'Unknown')} missing createdAt, using ObjectId time: {object_id.generation_time}"
        )

    return TodoItem.model_validate(doc_copy)


# GET all To-Do items for the user
@router.get("/", response_model=List[TodoItem])
async def get_user_todos(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    todos_cursor = db.todos.find({"userId": user_id}).sort("_id", -1)
    todo_docs = await todos_cursor.to_list(length=None)

    # Auto-migration: Update todos missing createdAt field
    todos_to_migrate = []
    for doc in todo_docs:
        if "createdAt" not in doc or doc["createdAt"] is None:
            todos_to_migrate.append(doc)

    if todos_to_migrate:
        print(f"Auto-migrating {len(todos_to_migrate)} todos for user {user_id}")
        for doc in todos_to_migrate:
            # Use ObjectId creation time as createdAt
            creation_time = doc["_id"].generation_time
            await db.todos.update_one(
                {"_id": doc["_id"]}, {"$set": {"createdAt": creation_time}}
            )
            # Update the doc for immediate return
            doc["createdAt"] = creation_time

    return [todo_from_db(doc) for doc in todo_docs]


# POST a new To-Do item
@router.post("/", response_model=TodoItem, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: CreateTodo,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    # Create the document with all required fields including timestamps
    todo_doc = {
        **todo_data.model_dump(),
        "userId": user_id,
        "status": "Not Started",
        "createdAt": datetime.now(timezone.utc),
        "logs": [],
        # inProgressAt and completedAt will be None/null by default
    }

    result = await db.todos.insert_one(todo_doc)
    created_todo = await db.todos.find_one({"_id": result.inserted_id})
    if not created_todo:
        raise HTTPException(status_code=500, detail="Failed to create todo")
    return todo_from_db(created_todo)


# PUT (update) a To-Do item
@router.put("/{todo_id}", response_model=TodoItem)
async def update_todo(
    todo_id: str,
    todo_data: UpdateTodo,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid To-Do ID.")

    update_data = todo_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided.")

    # Get the current todo to check existing timestamps
    current_todo = await db.todos.find_one(
        {"_id": ObjectId(todo_id), "userId": user_id}
    )
    if not current_todo:
        raise HTTPException(status_code=404, detail="To-Do not found.")

    # Handle automatic timestamp setting based on status changes
    if "status" in update_data:
        new_status = update_data["status"]

        # If moving to "In Progress" and no inProgressAt timestamp exists
        if new_status == "In Progress" and not current_todo.get("inProgressAt"):
            if (
                "inProgressAt" not in update_data
            ):  # Only set if not provided by frontend
                update_data["inProgressAt"] = datetime.now(timezone.utc)

        # If moving to "Done" and no completedAt timestamp exists
        elif new_status == "Done" and not current_todo.get("completedAt"):
            if "completedAt" not in update_data:  # Only set if not provided by frontend
                update_data["completedAt"] = datetime.now(timezone.utc)

    result = await db.todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="To-Do not found.")

    updated_todo = await db.todos.find_one({"_id": ObjectId(todo_id)})
    if not updated_todo:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated todo")
    return todo_from_db(updated_todo)


# DELETE a To-Do item
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid To-Do ID.")

    result = await db.todos.delete_one({"_id": ObjectId(todo_id), "userId": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="To-Do not found.")
    return


# POST a new log to a To-Do item
@router.post("/{todo_id}/logs", response_model=TodoItem)
async def add_todo_log(
    todo_id: str,
    log_data: CreateTodoLog,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid To-Do ID.")

    # 2. THE FIX: Explicitly create the log document here.
    # This guarantees a new ObjectId and a timezone-aware UTC timestamp.
    log_doc = {
        "_id": ObjectId(),
        "timestamp": datetime.now(timezone.utc),
        "notes": log_data.notes,
    }

    result = await db.todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id}, {"$push": {"logs": log_doc}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="To-Do not found.")

    updated_todo = await db.todos.find_one({"_id": ObjectId(todo_id)})
    if not updated_todo:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated todo")
    return todo_from_db(updated_todo)


# Admin endpoint for migrating todos (remove after migration is complete)
@router.post("/migrate", status_code=status.HTTP_200_OK)
async def migrate_user_todos(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Migrate user's todos to add missing timestamp fields"""

    # Find todos missing createdAt
    todos_missing_created = await db.todos.count_documents(
        {"userId": user_id, "createdAt": {"$exists": False}}
    )

    if todos_missing_created == 0:
        return {"message": "No todos need migration", "migrated_count": 0}

    migrated_count = 0
    async for todo in db.todos.find(
        {"userId": user_id, "createdAt": {"$exists": False}}
    ):
        # Use ObjectId creation time
        creation_time = todo["_id"].generation_time

        await db.todos.update_one(
            {"_id": todo["_id"]}, {"$set": {"createdAt": creation_time}}
        )
        migrated_count += 1

    return {
        "message": f"Successfully migrated {migrated_count} todos",
        "migrated_count": migrated_count,
    }
