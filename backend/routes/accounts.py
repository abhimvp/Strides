from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.database import get_database
from models.account_models import Account, CreateAccount, UpdateAccount
from utils.security import get_current_user
from bson import ObjectId

router = APIRouter()


@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: CreateAccount,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Create a new bank account for the logged-in user.
    """
    account_dict = account_data.model_dump()
    # print("Creating account with data:", account_dict)
    account_dict["userId"] = user_id
    # print("Account data with userId:", account_dict)

    result = await db.accounts.insert_one(account_dict)
    # print("Inserted account with ID:", result.inserted_id)
    created_account = await db.accounts.find_one({"_id": result.inserted_id})
    # print("Created account:", created_account)

    return Account(**created_account)


@router.get("/", response_model=List[Account])
async def get_user_accounts(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Retrieve all accounts for the logged-in user.
    """
    accounts_cursor = db.accounts.find({"userId": user_id})
    # print("Fetching accounts for user:", user_id)
    accounts = await accounts_cursor.to_list(length=10)
    # print("Fetched accounts:", accounts)
    return [Account(**account) for account in accounts]


@router.get("/{account_id}", response_model=Account)
async def get_account(
    account_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Retrieve a single account by its ID.
    """
    if not ObjectId.is_valid(account_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account ID"
        )

    account = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "userId": user_id}
    )

    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    return Account(**account)


@router.put("/{account_id}", response_model=Account)
async def update_account(
    account_id: str,
    account_data: UpdateAccount,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Update an existing account.
    """
    if not ObjectId.is_valid(account_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account ID"
        )

    update_data = {k: v for k, v in account_data.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided"
        )

    result = await db.accounts.update_one(
        {"_id": ObjectId(account_id), "userId": user_id}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or you don't have permission to update it",
        )

    updated_account = await db.accounts.find_one({"_id": ObjectId(account_id)})
    return Account(**updated_account)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Delete an account.
    """
    if not ObjectId.is_valid(account_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account ID"
        )

    result = await db.accounts.delete_one(
        {"_id": ObjectId(account_id), "userId": user_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or you don't have permission to delete it",
        )

    return
