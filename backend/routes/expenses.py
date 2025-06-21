# abhimvp/strides/Strides-2ea9c93a16d1a802952c0df586eba52a01a7b19a/backend/routes/expenses.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from models.expense_models import Account, ExpenseCategory, Transaction, AccountCreate
from utils.database import database
from utils.security import get_current_user
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# --- Collection Definitions ---
ACCOUNTS_COLLECTION = "accounts"
CATEGORIES_COLLECTION = "expense_categories"
TRANSACTIONS_COLLECTION = "transactions"

# --- Database Collection Objects ---
accounts_collection = database.get_collection(ACCOUNTS_COLLECTION)
categories_collection = database.get_collection(CATEGORIES_COLLECTION)
transactions_collection = database.get_collection(TRANSACTIONS_COLLECTION)


# --- Helper function for database session ---
# This is needed for database transactions to ensure data integrity
async def get_db_session() -> AsyncIOMotorClient:
    return database.client


# --- Account Management ---


@router.post(
    "/accounts/",
    response_model=Account,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new financial account",
)
async def create_account(
    account_data: AccountCreate, # CORRECTED: Use AccountCreate for the input
    current_user_email: str = Depends(get_current_user),
):
    # Now this code will be reached
    print(f"Request received to create account for user: {current_user_email}")
    
    # Combine the input data with the server-side data (owner_id)
    account_dict = account_data.model_dump()
    account_dict["owner_id"] = current_user_email
    
    print(f"Final account data for DB: {account_dict}")

    result = await accounts_collection.insert_one(account_dict)
    created_account = await accounts_collection.find_one({"_id": result.inserted_id})
    
    if created_account is None:
        raise HTTPException(status_code=500, detail="Failed to create account in database.")
        
    return created_account


@router.get(
    "/accounts/",
    response_model=List[Account],
    summary="Get all financial accounts for the current user",
)
async def get_accounts(
    current_user_email: str = Depends(get_current_user),
):
    accounts = []
    cursor = accounts_collection.find({"owner_id": current_user_email})
    async for account in cursor:
        accounts.append(account)
    return accounts


# --- Category Management ---


@router.post(
    "/categories/",
    response_model=ExpenseCategory,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new expense category",
)
async def create_expense_category(
    category: ExpenseCategory,
    current_user_email: str = Depends(get_current_user),
):
    category.owner_id = current_user_email
    if category.parent_id:
        parent_category = await categories_collection.find_one(
            {"_id": ObjectId(category.parent_id), "owner_id": current_user_email}
        )
        if not parent_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent category with id {category.parent_id} not found.",
            )
    category_dict = category.dict(by_alias=True)
    category_dict.pop("id", None)

    result = await categories_collection.insert_one(category_dict)
    created_category = await categories_collection.find_one({"_id": result.inserted_id})
    return created_category


@router.get(
    "/categories/",
    response_model=List[ExpenseCategory],
    summary="Get all expense categories for the current user",
)
async def get_expense_categories(current_user_email: str = Depends(get_current_user)):
    categories = []
    cursor = categories_collection.find({"owner_id": current_user_email})
    async for category in cursor:
        categories.append(category)
    return categories


# --- Transaction Management ---


@router.post(
    "/transactions/",
    response_model=Transaction,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transaction",
)
async def create_transaction(
    transaction: Transaction,
    current_user_email: str = Depends(get_current_user),
    db_session: AsyncIOMotorClient = Depends(get_db_session),
):
    """
    Creates a new transaction (expense, income, or transfer) and updates account balances.
    This operation is performed within a database transaction to ensure all-or-nothing consistency.
    """
    transaction.owner_id = current_user_email

    async with await db_session.start_session() as session:
        async with session.with_transaction():
            # --- General Validations ---
            if transaction.type in ["expense", "income"]:
                if not transaction.account_id or not transaction.category_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Account and Category are required for expense/income.",
                    )

                # Verify account and category belong to the user
                account = await accounts_collection.find_one(
                    {
                        "_id": ObjectId(transaction.account_id),
                        "owner_id": current_user_email,
                    },
                    session=session,
                )
                category = await categories_collection.find_one(
                    {
                        "_id": ObjectId(transaction.category_id),
                        "owner_id": current_user_email,
                    },
                    session=session,
                )
                if not account:
                    raise HTTPException(status_code=404, detail="Account not found.")
                if not category:
                    raise HTTPException(status_code=404, detail="Category not found.")

                # --- Balance Updates ---
                update_amount = (
                    -transaction.amount
                    if transaction.type == "expense"
                    else transaction.amount
                )
                await accounts_collection.update_one(
                    {"_id": ObjectId(transaction.account_id)},
                    {"$inc": {"balance": update_amount}},
                    session=session,
                )

            elif transaction.type == "transfer":
                if not transaction.from_account_id or not transaction.to_account_id:
                    raise HTTPException(
                        status_code=400,
                        detail="From and To accounts are required for a transfer.",
                    )

                # Verify accounts belong to the user
                from_acc = await accounts_collection.find_one(
                    {
                        "_id": ObjectId(transaction.from_account_id),
                        "owner_id": current_user_email,
                    },
                    session=session,
                )
                to_acc = await accounts_collection.find_one(
                    {
                        "_id": ObjectId(transaction.to_account_id),
                        "owner_id": current_user_email,
                    },
                    session=session,
                )
                if not from_acc:
                    raise HTTPException(
                        status_code=404, detail="Source account not found."
                    )
                if not to_acc:
                    raise HTTPException(
                        status_code=404, detail="Destination account not found."
                    )

                # --- Balance Updates ---
                await accounts_collection.update_one(
                    {"_id": ObjectId(transaction.from_account_id)},
                    {"$inc": {"balance": -transaction.amount}},
                    session=session,
                )
                await accounts_collection.update_one(
                    {"_id": ObjectId(transaction.to_account_id)},
                    {"$inc": {"balance": transaction.amount}},
                    session=session,
                )

            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid transaction type: {transaction.type}",
                )

            # --- Insert the transaction record ---
            transaction_dict = transaction.dict(by_alias=True)
            transaction_dict.pop("id", None)
            result = await transactions_collection.insert_one(
                transaction_dict, session=session
            )
            created_transaction = await transactions_collection.find_one(
                {"_id": result.inserted_id}, session=session
            )
            return created_transaction


@router.get(
    "/transactions/",
    response_model=List[Transaction],
    summary="Get all transactions for the current user",
)
async def get_transactions(
    current_user_email: str = Depends(get_current_user),
    limit: int = 100,  # Add a limit to avoid fetching excessive data
):
    """
    Retrieve all financial transactions for the currently authenticated user,
    sorted by the most recent date.
    """
    transactions = []
    # Sort by date descending (-1)
    cursor = (
        transactions_collection.find({"owner_id": current_user_email})
        .sort("date", -1)
        .limit(limit)
    )
    async for transaction in cursor:
        transactions.append(transaction)
    return transactions
