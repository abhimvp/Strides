from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from models.task_models import UserTasks, Category
from utils.database import database
from utils.security import get_current_user

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
