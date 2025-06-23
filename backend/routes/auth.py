from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.category_models import SubCategory  # Import the SubCategory model
from models.user_models import UserCreate, UserInDB, Token
from utils.database import database
from utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()
user_collection = database.get_collection("users")
category_collection = database.get_collection(
    "categories"
)  # Add collection for categories

# Define the default categories and sub-categories for new users
DEFAULT_CATEGORIES = [
    {
        "name": "Food & Dining",
        "subcategories": [
            SubCategory(name="Groceries").model_dump(by_alias=True),
            SubCategory(name="Restaurants").model_dump(by_alias=True),
            SubCategory(name="Street Food").model_dump(by_alias=True),
        ],
    },
    {
        "name": "Shopping",
        "subcategories": [
            SubCategory(name="Clothing").model_dump(by_alias=True),
            SubCategory(name="Electronics").model_dump(by_alias=True),
            SubCategory(name="Personal Care").model_dump(by_alias=True),
        ],
    },
    {
        "name": "Bills & Utilities",
        "subcategories": [
            SubCategory(name="Electricity").model_dump(by_alias=True),
            SubCategory(name="Water").model_dump(by_alias=True),
            SubCategory(name="Internet").model_dump(by_alias=True),
            SubCategory(name="Rent").model_dump(by_alias=True),
        ],
    },
    {
        "name": "Transportation",
        "subcategories": [
            SubCategory(name="Gas/Fuel").model_dump(by_alias=True),
            SubCategory(name="Public Transit").model_dump(by_alias=True),
        ],
    },
    {"name": "Gifts & Donations", "subcategories": []},
    {"name": "Travel", "subcategories": []},
    {"name": "Entertainment", "subcategories": []},
    {"name": "Education", "subcategories": []},
]


@router.post("/signup", response_model=UserInDB)
async def signup(user: UserCreate):
    # Check if user already exists
    db_user = await user_collection.find_one({"email": user.email})
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password and create the user
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]

    new_user = await user_collection.insert_one(user_dict)
    # --- Create default categories for the new user ---
    new_user_id = str(new_user.inserted_id)
    categories_to_insert = []
    for cat in DEFAULT_CATEGORIES:
        category_doc = {
            "userId": new_user_id,
            "name": cat["name"],
            "isDefault": True,
            "subcategories": cat["subcategories"],
        }
        categories_to_insert.append(category_doc)

    if categories_to_insert:
        await category_collection.insert_many(categories_to_insert)

    created_user = await user_collection.find_one({"_id": new_user.inserted_id})

    return created_user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username})

    # Note: form_data.username is the email in our case
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
