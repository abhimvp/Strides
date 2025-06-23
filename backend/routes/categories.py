from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from utils.database import get_database
from utils.security import get_current_user
from models.category_models import (
    Category,
    CreateCategory,
    SubCategory,
    CreateSubCategory,
)

router = APIRouter()


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CreateCategory,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Creates a new main category for the user."""
    # Check for duplicate category name
    existing_category = await db.categories.find_one(
        {"userId": user_id, "name": category_data.name}
    )
    if existing_category:
        raise HTTPException(
            status_code=400, detail="A category with this name already exists."
        )

    category_doc = {"name": category_data.name, "userId": user_id, "subcategories": []}
    result = await db.categories.insert_one(category_doc)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return Category(**created_category)


@router.get("/", response_model=List[Category])
async def get_user_categories(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Retrieves all categories and their sub-categories for the user."""
    categories_cursor = db.categories.find({"userId": user_id})
    return await categories_cursor.to_list(length=100)


@router.post("/{category_id}/subcategories", response_model=Category)
async def create_subcategory(
    category_id: str,
    subcategory_data: CreateSubCategory,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Adds a sub-category to an existing main category."""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID.")

    # Find the parent category
    parent_category = await db.categories.find_one(
        {"_id": ObjectId(category_id), "userId": user_id}
    )
    if not parent_category:
        raise HTTPException(status_code=404, detail="Parent category not found.")

    # Check for duplicate sub-category name within the same category
    if any(
        sub["name"] == subcategory_data.name
        for sub in parent_category.get("subcategories", [])
    ):
        raise HTTPException(
            status_code=400, detail="This sub-category already exists in this category."
        )

    new_sub = SubCategory(name=subcategory_data.name)

    await db.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$push": {"subcategories": new_sub.model_dump(by_alias=True)}},
    )

    updated_category = await db.categories.find_one({"_id": ObjectId(category_id)})
    return Category(**updated_category)


# Note: We can add DELETE endpoints for categories and sub-categories later if needed.
