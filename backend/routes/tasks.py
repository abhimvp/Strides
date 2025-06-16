from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from models.task_models import UserTasks, Category
from utils.database import database
from utils.security import get_current_user
from datetime import datetime, date
from calendar import monthrange

router = APIRouter()
tasks_collection = database.get_collection("tasks")


@router.get("/", response_model=UserTasks)
async def get_user_tasks(current_user_email: str = Depends(get_current_user)):
    """
    Retrieve all tasks and categories for the logged-in user.
    If they don't have any tasks set up, it returns an empty list.
    """
    user_tasks_doc = await tasks_collection.find_one({"owner_id": current_user_email})
    if user_tasks_doc:
        return user_tasks_doc

    # If no tasks found, return a default structure
    return {"owner_id": current_user_email, "categories": []}


@router.post("/", response_model=UserTasks, status_code=status.HTTP_201_CREATED)
async def setup_initial_tasks(
    categories: List[Category], current_user_email: str = Depends(get_current_user)
):
    """
    Create the initial set of tasks for a new user.
    This will overwrite any existing tasks for that user.
    """
    # Check if tasks for this user already exist
    existing_tasks = await tasks_collection.find_one({"owner_id": current_user_email})
    if existing_tasks:
        # If they exist, we replace them. This is for the initial setup.
        await tasks_collection.delete_one({"owner_id": current_user_email})

    user_tasks_data = {
        "owner_id": current_user_email,
        "categories": [cat.dict() for cat in categories],
    }

    await tasks_collection.insert_one(user_tasks_data)

    # Fetch the newly created document to return it
    new_doc = await tasks_collection.find_one({"owner_id": current_user_email})
    return new_doc


@router.put("/", response_model=UserTasks)
async def update_user_tasks(
    categories: List[Category], current_user_email: str = Depends(get_current_user)
):
    """
    Update the entire task list for a user.
    This is useful for toggling a task's history.
    """
    update_data = {"categories": [cat.dict() for cat in categories]}

    updated_doc = await tasks_collection.find_one_and_update(
        {"owner_id": current_user_email}, {"$set": update_data}, return_document=True
    )

    if not updated_doc:
        raise HTTPException(
            status_code=404, detail="No tasks found for this user to update."
        )

    return updated_doc


@router.get("/history", response_model=Dict[int, List[str]])
async def get_monthly_history(
    year: int,
    month: int,
    current_user_email: str = Depends(get_current_user),
):
    """
    Retrieve a map of tasks and their completed dates for a specific month.
    The response will be like: { "taskId": ["2025-06-15", "2025-06-16"], ... }
    """
    # Calculate the start and end dates for the given month
    start_date_str = date(year, month, 1).isoformat()
    _, num_days = monthrange(year, month)
    end_date_str = date(year, month, num_days).isoformat()

    pipeline = [
        # 1. Find the document for the logged-in user
        {"$match": {"owner_id": current_user_email}},
        # 2. Deconstruct the arrays to process each task individually
        {"$unwind": "$categories"},
        {"$unwind": "$categories.tasks"},
        # 3. Reshape the data and filter the history for the requested month
        {
            "$project": {
                "task_id": "$categories.tasks.id",
                "completed_dates": {
                    "$filter": {
                        "input": "$categories.tasks.history",
                        "as": "h",
                        "cond": {
                            "$and": [
                                {"$gte": ["$$h.date", start_date_str]},
                                {"$lte": ["$$h.date", end_date_str]},
                                {"$eq": ["$$h.completed", True]},
                            ]
                        },
                    }
                },
            }
        },
        # 4. Group the results by task ID
        {
            "$group": {
                "_id": "$task_id",
                "completed_dates": {"$first": "$completed_dates.date"},
            }
        },
    ]

    cursor = tasks_collection.aggregate(pipeline)

    # 5. Format the result into the desired dictionary
    history_map = {}
    async for doc in cursor:
        if doc["_id"] is not None and doc["completed_dates"]:
            history_map[doc["_id"]] = doc["completed_dates"]

    return history_map
