from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from utils.database import get_database
from utils.security import get_current_user
from models.transaction_models import (
    Transaction,
    CreateTransaction,
    UpdateTransaction,
    CreateTransfer,
)

router = APIRouter()


@router.post("/", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: CreateTransaction,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Creates a new transaction and updates the corresponding account balance.
    """
    # 1. Validate the account ID
    if not ObjectId.is_valid(transaction_data.accountId):
        raise HTTPException(status_code=400, detail="Invalid account ID format.")

    account_id_obj = ObjectId(transaction_data.accountId)

    # 2. Find the account and ensure it belongs to the user
    account = await db.accounts.find_one({"_id": account_id_obj, "userId": user_id})
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or you do not have permission."
        )

    # 3. Calculate the new balance based on transaction type
    if transaction_data.type == "expense":
        new_balance = account["balance"] - transaction_data.amount
    elif transaction_data.type == "income":
        new_balance = account["balance"] + transaction_data.amount
    else:
        # This case is for safety, though our Pydantic model restricts the type
        raise HTTPException(status_code=400, detail="Invalid transaction type.")

    # 4. Update the account's balance in the database
    await db.accounts.update_one(
        {"_id": account_id_obj}, {"$set": {"balance": new_balance}}
    )

    # 5. Create and save the new transaction document
    transaction_doc = transaction_data.model_dump()
    transaction_doc["userId"] = user_id
    if transaction_data.date is None:
        transaction_doc["date"] = datetime.now()

    result = await db.transactions.insert_one(transaction_doc)
    created_transaction = await db.transactions.find_one({"_id": result.inserted_id})

    return Transaction(**created_transaction)


@router.get("/", response_model=List[Transaction])
async def get_user_transactions(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Retrieves all transactions for the logged-in user, sorted by date descending.
    """
    # Sort by "_id" descending. This uses the timestamp embedded in the
    # MongoDB ObjectId to sort by the exact time of creation.
    transactions_cursor = db.transactions.find({"userId": user_id}).sort("_id", -1)
    # We'll limit to the most recent 100 transactions for now for performance
    return await transactions_cursor.to_list(length=10)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Deletes a transaction and reverts the balance change on the account.
    For transfers, deletes both transactions and reverts both account balances."""
    if not ObjectId.is_valid(transaction_id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID.")

    transaction_obj_id = ObjectId(transaction_id)
    transaction = await db.transactions.find_one(
        {"_id": transaction_obj_id, "userId": user_id}
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if transaction["type"] == "transfer":
        # Handle transfer deletion - need to delete both transactions and revert both balances
        await delete_transfer_transactions(db, transaction, user_id)
    else:
        # Handle regular transaction deletion
        account = await db.accounts.find_one(
            {"_id": ObjectId(transaction["accountId"]), "userId": user_id}
        )
        if account:
            # Revert the balance change
            if transaction["type"] == "expense":
                new_balance = account["balance"] + transaction["amount"]
            else:  # income
                new_balance = account["balance"] - transaction["amount"]
            await db.accounts.update_one(
                {"_id": ObjectId(account["_id"])}, {"$set": {"balance": new_balance}}
            )

        # Delete the transaction
        await db.transactions.delete_one({"_id": transaction_obj_id})

    return


async def delete_transfer_transactions(
    db: AsyncIOMotorDatabase, transaction: dict, user_id: str
):
    """Helper function to delete both transfer transactions and revert account balances."""

    # Find the companion transfer transaction
    # If this is a transfer out, find the transfer in, and vice versa
    if transaction.get("transferDirection") == "out":
        # This is the source transaction, find the destination transaction
        companion_tx = await db.transactions.find_one(
            {
                "userId": user_id,
                "type": "transfer",
                "transferDirection": "in",
                "toAccountId": transaction[
                    "accountId"
                ],  # The companion's toAccountId points back to this account
                "date": transaction["date"],  # Same transfer should have same date
            }
        )
        source_tx = transaction
        dest_tx = companion_tx
    else:
        # This is the destination transaction, find the source transaction
        companion_tx = await db.transactions.find_one(
            {
                "userId": user_id,
                "type": "transfer",
                "transferDirection": "out",
                "toAccountId": transaction[
                    "accountId"
                ],  # The companion's toAccountId points to this account
                "date": transaction["date"],  # Same transfer should have same date
            }
        )
        source_tx = companion_tx
        dest_tx = transaction

    if not companion_tx:
        # If we can't find the companion transaction, just handle this one as a regular transaction
        # This could happen for old transfers or corrupted data
        account = await db.accounts.find_one(
            {"_id": ObjectId(transaction["accountId"]), "userId": user_id}
        )
        if account:
            # Revert based on transfer direction
            if transaction.get("transferDirection") == "out":
                # Add money back to source account
                new_balance = account["balance"] + transaction["amount"]
            else:
                # Remove money from destination account
                new_balance = account["balance"] - transaction["amount"]

            await db.accounts.update_one(
                {"_id": ObjectId(account["_id"])}, {"$set": {"balance": new_balance}}
            )

        # Delete just this transaction
        await db.transactions.delete_one({"_id": ObjectId(transaction["_id"])})
        return

    # Revert balances for both accounts
    # Source account: add back the original amount
    if source_tx:
        source_account = await db.accounts.find_one(
            {"_id": ObjectId(source_tx["accountId"]), "userId": user_id}
        )
        if source_account:
            new_source_balance = source_account["balance"] + source_tx["amount"]
            await db.accounts.update_one(
                {"_id": ObjectId(source_account["_id"])},
                {"$set": {"balance": new_source_balance}},
            )

    # Destination account: subtract the received amount
    if dest_tx:
        dest_account = await db.accounts.find_one(
            {"_id": ObjectId(dest_tx["accountId"]), "userId": user_id}
        )
        if dest_account:
            new_dest_balance = dest_account["balance"] - dest_tx["amount"]
            await db.accounts.update_one(
                {"_id": ObjectId(dest_account["_id"])},
                {"$set": {"balance": new_dest_balance}},
            )

    # Delete both transactions
    if source_tx:
        await db.transactions.delete_one({"_id": ObjectId(source_tx["_id"])})
    if dest_tx:
        await db.transactions.delete_one({"_id": ObjectId(dest_tx["_id"])})


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    transaction_data: UpdateTransaction,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """Updates a transaction and correctly adjusts the account balance."""
    if not ObjectId.is_valid(transaction_id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID.")

    transaction_obj_id = ObjectId(transaction_id)
    original_tx = await db.transactions.find_one(
        {"_id": transaction_obj_id, "userId": user_id}
    )
    if not original_tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    account = await db.accounts.find_one(
        {"_id": ObjectId(original_tx["accountId"]), "userId": user_id}
    )
    if not account:
        raise HTTPException(status_code=404, detail="Associated account not found.")

    # 1. Revert the original transaction amount from the balance
    if original_tx["type"] == "expense":
        reverted_balance = account["balance"] + original_tx["amount"]
    else:  # income
        reverted_balance = account["balance"] - original_tx["amount"]

    # 2. Apply the new transaction amount to the reverted balance
    new_amount = (
        transaction_data.amount
        if transaction_data.amount is not None
        else original_tx["amount"]
    )
    if original_tx["type"] == "expense":
        final_balance = reverted_balance - new_amount
    else:  # income
        final_balance = reverted_balance + new_amount

    await db.accounts.update_one(
        {"_id": ObjectId(account["_id"])}, {"$set": {"balance": final_balance}}
    )

    # 3. Update the transaction document itself
    update_data = transaction_data.model_dump(exclude_unset=True)
    await db.transactions.update_one({"_id": transaction_obj_id}, {"$set": update_data})

    updated_tx = await db.transactions.find_one({"_id": transaction_obj_id})
    return Transaction(**updated_tx)


@router.post(
    "/transfer",
    response_model=List[Transaction],
    status_code=status.HTTP_201_CREATED,
)
async def create_transfer(
    transfer_data: CreateTransfer,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Creates a transfer between two accounts. Handles domestic and international transfers.
    """
    # 1. Validate account IDs
    if not ObjectId.is_valid(transfer_data.fromAccountId) or not ObjectId.is_valid(
        transfer_data.toAccountId
    ):
        raise HTTPException(status_code=400, detail="Invalid account ID format.")

    from_account_id = ObjectId(transfer_data.fromAccountId)
    to_account_id = ObjectId(transfer_data.toAccountId)

    # 2. Find both accounts and ensure they belong to the user
    from_account = await db.accounts.find_one(
        {"_id": from_account_id, "userId": user_id}
    )
    to_account = await db.accounts.find_one({"_id": to_account_id, "userId": user_id})

    if not from_account or not to_account:
        raise HTTPException(
            status_code=404,
            detail="One or both accounts not found or you do not have permission.",
        )

    # 3. Check if source account has sufficient balance
    if from_account["balance"] < transfer_data.amount:
        raise HTTPException(
            status_code=400, detail="Insufficient balance in source account."
        )

    # 4. Calculate transferred amount
    transferred_amount = transfer_data.amount
    if transfer_data.commission:
        transferred_amount -= transfer_data.commission

    if transfer_data.exchangeRate:
        transferred_amount *= transfer_data.exchangeRate

    # 5. Update account balances
    new_from_balance = from_account["balance"] - transfer_data.amount
    new_to_balance = to_account["balance"] + transferred_amount

    await db.accounts.update_one(
        {"_id": from_account_id}, {"$set": {"balance": new_from_balance}}
    )
    await db.accounts.update_one(
        {"_id": to_account_id}, {"$set": {"balance": new_to_balance}}
    )

    # 6. Create or get transfer category
    transfer_category = await db.categories.find_one(
        {"userId": user_id, "name": "Transfer"}
    )
    if not transfer_category:
        # Create transfer category if it doesn't exist
        transfer_category_doc = {
            "name": "Transfer",
            "userId": user_id,
            "subcategories": [],
        }
        result = await db.categories.insert_one(transfer_category_doc)
        transfer_category = await db.categories.find_one({"_id": result.inserted_id})

    if transfer_category:
        transfer_category_id = str(transfer_category["_id"])
    else:
        raise HTTPException(
            status_code=500, detail="Failed to create transfer category"
        )

    # 7. Create transaction records
    transfer_date = transfer_data.date if transfer_data.date else datetime.now()

    # Create "transfer out" transaction for source account (negative amount)
    from_transaction_doc = {
        "userId": user_id,
        "accountId": transfer_data.fromAccountId,
        "type": "transfer",
        "amount": transfer_data.amount,  # Original amount sent
        "date": transfer_date,
        "categoryId": transfer_category_id,
        "notes": transfer_data.notes or f"Transfer to {to_account['accountName']}",
        "toAccountId": transfer_data.toAccountId,
        "transferDirection": "out",
        "exchangeRate": transfer_data.exchangeRate,
        "commission": transfer_data.commission,
        "serviceName": transfer_data.serviceName,
        "transferredAmount": transferred_amount,
    }

    # Create "transfer in" transaction for destination account (positive amount)
    to_transaction_doc = {
        "userId": user_id,
        "accountId": transfer_data.toAccountId,
        "type": "transfer",
        "amount": transferred_amount,  # Amount received after conversion/fees
        "date": transfer_date,
        "categoryId": transfer_category_id,
        "notes": transfer_data.notes or f"Transfer from {from_account['accountName']}",
        "toAccountId": transfer_data.fromAccountId,  # Reference back to source
        "transferDirection": "in",
        "exchangeRate": transfer_data.exchangeRate,
        "commission": transfer_data.commission,
        "serviceName": transfer_data.serviceName,
        "transferredAmount": transferred_amount,
    }

    # Insert both transactions
    from_result = await db.transactions.insert_one(from_transaction_doc)
    to_result = await db.transactions.insert_one(to_transaction_doc)

    # Fetch and return both created transactions
    from_transaction = await db.transactions.find_one({"_id": from_result.inserted_id})
    to_transaction = await db.transactions.find_one({"_id": to_result.inserted_id})

    # Convert ObjectId to string for Pydantic and validate
    if not from_transaction or not to_transaction:
        raise HTTPException(
            status_code=500, detail="Failed to create transfer transactions"
        )

    from_transaction["_id"] = str(from_transaction["_id"])
    to_transaction["_id"] = str(to_transaction["_id"])

    return [Transaction(**from_transaction), Transaction(**to_transaction)]
