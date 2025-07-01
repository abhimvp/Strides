from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.database import get_database
from models.account_models import (
    Account,
    CreateAccount,
    UpdateAccount,
    CreditCardAnalysis,
    PaymentOption,
    CreditCardPaymentSuggestion,
)
from utils.security import get_current_user
from bson import ObjectId
from datetime import datetime, timedelta

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
    account_dict["userId"] = user_id

    result = await db.accounts.insert_one(account_dict)
    created_account = await db.accounts.find_one({"_id": result.inserted_id})

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
    accounts = await accounts_cursor.to_list(length=10)
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


@router.get("/{account_id}/credit-analysis", response_model=CreditCardAnalysis)
async def get_credit_card_analysis(
    account_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Get detailed analysis for a credit card account including payment suggestions.
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

    if account["accountType"] != "credit_card":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis only available for credit card accounts",
        )

    # Calculate analysis data
    current_balance = account["balance"]
    credit_limit = account.get("creditLimit", 0)
    available_credit = max(0, credit_limit - current_balance)
    credit_utilization = (
        (current_balance / credit_limit * 100) if credit_limit > 0 else 0
    )

    # Calculate days until due
    payment_due_date = account.get("paymentDueDate")
    days_until_due = None
    is_overdue = False

    if payment_due_date:
        if isinstance(payment_due_date, str):
            payment_due_date = datetime.fromisoformat(
                payment_due_date.replace("Z", "+00:00")
            )
        days_until_due = (payment_due_date.date() - datetime.now().date()).days
        is_overdue = days_until_due < 0

    minimum_due = account.get(
        "minimumPaymentDue", current_balance * 0.02
    )  # Default 2% if not set

    # Generate payment options
    payment_options = [
        PaymentOption(
            type="minimum",
            amount=minimum_due,
            description=f"Minimum payment due",
            impact="Avoids late fees, maintains good standing",
        ),
        PaymentOption(
            type="recommended",
            amount=min(current_balance, minimum_due * 2),
            description="Recommended payment",
            impact="Reduces debt faster, saves on interest",
        ),
        PaymentOption(
            type="full",
            amount=current_balance,
            description="Pay full balance",
            impact="Eliminates debt completely, maximizes credit score benefit",
        ),
    ]

    return CreditCardAnalysis(
        currentBalance=current_balance,
        creditLimit=credit_limit,
        availableCredit=available_credit,
        creditUtilization=round(credit_utilization, 2),
        minimumPaymentDue=minimum_due,
        paymentDueDate=payment_due_date,
        daysUntilDue=days_until_due,
        isOverdue=is_overdue,
        recommendedPayment=min(current_balance, minimum_due * 2),
        paymentOptions=payment_options,
    )


@router.get(
    "/{account_id}/payment-suggestions", response_model=CreditCardPaymentSuggestion
)
async def get_payment_suggestions(
    account_id: str,
    available_budget: Optional[float] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(get_current_user),
):
    """
    Get personalized payment suggestions based on user's financial situation.
    """
    if not ObjectId.is_valid(account_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account ID"
        )

    account = await db.accounts.find_one(
        {"_id": ObjectId(account_id), "userId": user_id}
    )

    if account is None or account["accountType"] != "credit_card":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card account not found",
        )

    current_balance = account["balance"]
    minimum_due = account.get("minimumPaymentDue", current_balance * 0.02)
    payment_due_date = account.get("paymentDueDate")

    # Calculate urgency
    urgency = "low"
    reasoning = "Regular payment maintains good credit standing"

    if payment_due_date:
        if isinstance(payment_due_date, str):
            payment_due_date = datetime.fromisoformat(
                payment_due_date.replace("Z", "+00:00")
            )
        days_until_due = (payment_due_date.date() - datetime.now().date()).days

        if days_until_due < 0:
            urgency = "high"
            reasoning = "Payment is overdue! Pay immediately to avoid penalties"
        elif days_until_due <= 3:
            urgency = "high"
            reasoning = "Payment due very soon, pay now to avoid late fees"
        elif days_until_due <= 7:
            urgency = "medium"
            reasoning = "Payment due within a week, plan payment soon"

    # Calculate recommended amount based on available budget
    recommended_amount = minimum_due
    if available_budget:
        recommended_amount = min(available_budget, current_balance)
        if recommended_amount < minimum_due:
            urgency = "high"
            reasoning = (
                "Insufficient budget for minimum payment - consider adjusting expenses"
            )

    return CreditCardPaymentSuggestion(
        minimumDue=minimum_due,
        recommendedAmount=recommended_amount,
        fullBalance=current_balance,
        urgency=urgency,
        reasoning=reasoning,
        payoffTimeline=(
            f"~{int(current_balance / recommended_amount)} months"
            if recommended_amount > 0
            else None
        ),
    )
