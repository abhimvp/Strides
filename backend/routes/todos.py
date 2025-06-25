from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List

from utils.database import get_database
from utils.security import get_current_user
from models.todo_models import (
    TodoItem,
    CreateTodo,
    UpdateTodo,
    TodoLog,
    CreateTodoLog,
)

router = APIRouter()


# GET all To-Do items for the user
@router.get("/", response_model=List[TodoItem])
async def get_user_todos(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    todos_cursor = db.todos.find({"userId": user_id}).sort("_id", -1)
    return await todos_cursor.to_list(length=None)


# POST a new To-Do item
@router.post("/", response_model=TodoItem, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: CreateTodo,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    todo_doc = todo_data.model_dump()
    todo_doc["userId"] = user_id
    result = await db.todos.insert_one(todo_doc)
    created_todo = await db.todos.find_one({"_id": result.inserted_id})
    return TodoItem(**created_todo)


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

    result = await db.todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="To-Do not found.")

    updated_todo = await db.todos.find_one({"_id": ObjectId(todo_id)})
    return TodoItem(**updated_todo)


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

    log_doc = TodoLog(notes=log_data.notes).model_dump(by_alias=True)

    result = await db.todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id}, {"$push": {"logs": log_doc}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="To-Do not found.")

    updated_todo = await db.todos.find_one({"_id": ObjectId(todo_id)})
    return TodoItem(**updated_todo)
