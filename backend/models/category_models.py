# This file will define the structure for a main category and its sub-categories.
from typing import List, Optional
from pydantic import BaseModel, Field
from .user_models import PyObjectId
from bson import ObjectId  # --- 1. Import ObjectId ---


class SubCategory(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str


class Category(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str
    name: str
    isDefault: bool = False
    subcategories: List[SubCategory] = []


class CreateCategory(BaseModel):
    name: str


class CreateSubCategory(BaseModel):
    name: str
