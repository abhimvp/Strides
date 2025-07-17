# backend/routes/trips.py
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from utils.database import database
from utils.security import get_current_user
from models.trip_models import (
    Trip,
    TripCreate,
    TripUpdate,
    ParticipantCreate,
    TransactionCreate,
)

router = APIRouter()
trips_collection = database.get_collection("trips")


@router.get("/", response_model=List[Trip])
async def get_trips(current_user_email: str = Depends(get_current_user)):
    """Get all trips for the current user"""

    trips = []
    async for trip in trips_collection.find({"user_id": current_user_email}):
        trip["id"] = str(trip["_id"])
        del trip["_id"]
        trips.append(trip)

    return trips


@router.post("/", response_model=Trip)
async def create_trip(
    trip_data: TripCreate, current_user_email: str = Depends(get_current_user)
):
    """Create a new trip"""

    # Create trip document
    trip_doc = {
        "name": trip_data.name,
        "destinations": trip_data.destinations,
        "participants": [],
        "transactions": [],
        "start_date": trip_data.start_date,
        "end_date": trip_data.end_date,
        "status": "planning",
        "leader_id": current_user_email,
        "user_id": current_user_email,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    # Insert the trip
    result = await trips_collection.insert_one(trip_doc)

    # Return the created trip
    created_trip = await trips_collection.find_one({"_id": result.inserted_id})
    if created_trip:
        created_trip["id"] = str(created_trip["_id"])
        del created_trip["_id"]

    return created_trip


@router.get("/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str, current_user_email: str = Depends(get_current_user)):
    """Get a specific trip by ID"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    trip = await trips_collection.find_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip["id"] = str(trip["_id"])
    del trip["_id"]
    return trip


@router.put("/{trip_id}", response_model=Trip)
async def update_trip(
    trip_id: str,
    trip_data: TripUpdate,
    current_user_email: str = Depends(get_current_user),
):
    """Update a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Prepare update data
    update_data = {}
    if trip_data.name is not None:
        update_data["name"] = trip_data.name
    if trip_data.destinations is not None:
        update_data["destinations"] = trip_data.destinations
    if trip_data.start_date is not None:
        update_data["start_date"] = trip_data.start_date
    if trip_data.end_date is not None:
        update_data["end_date"] = trip_data.end_date
    if trip_data.status is not None:
        update_data["status"] = trip_data.status

    update_data["updated_at"] = datetime.now()

    # Update the trip
    result = await trips_collection.update_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Return updated trip
    updated_trip = await trips_collection.find_one({"_id": ObjectId(trip_id)})
    if updated_trip:
        updated_trip["id"] = str(updated_trip["_id"])
        del updated_trip["_id"]

    return updated_trip


@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str, current_user_email: str = Depends(get_current_user)
):
    """Delete a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    result = await trips_collection.delete_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    return {"message": "Trip deleted successfully"}


@router.post("/{trip_id}/participants")
async def add_participant(
    trip_id: str,
    participant_data: ParticipantCreate,
    current_user_email: str = Depends(get_current_user),
):
    """Add a participant to a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Create participant document
    participant_doc = {
        "id": str(ObjectId()),
        "name": participant_data.name,
        "email": participant_data.email,
        "initial_contribution": participant_data.initial_contribution,
        "total_contributed": participant_data.initial_contribution,
        "payment_method": participant_data.payment_method or "cash",
    }

    # Add participant to trip
    result = await trips_collection.update_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email},
        {
            "$push": {"participants": participant_doc},
            "$set": {"updated_at": datetime.now()},
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    return {"message": "Participant added successfully", "participant": participant_doc}


@router.delete("/{trip_id}/participants/{participant_id}")
async def remove_participant(
    trip_id: str,
    participant_id: str,
    current_user_email: str = Depends(get_current_user),
):
    """Remove a participant from a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Debug: Get current trip to see participant structure
    current_trip = await trips_collection.find_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )
    if not current_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    print(f"DEBUG: Removing participant {participant_id} from trip {trip_id}")
    print(f"DEBUG: Current participants: {current_trip.get('participants', [])}")

    # Remove participant from trip
    result = await trips_collection.update_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email},
        {
            "$pull": {"participants": {"id": participant_id}},
            "$set": {"updated_at": datetime.now()},
        },
    )

    print(
        f"DEBUG: Update result - matched: {result.matched_count}, modified: {result.modified_count}"
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Participant not found")

    return {"message": "Participant removed successfully"}


@router.put("/{trip_id}/participants/{participant_id}")
async def update_participant(
    trip_id: str,
    participant_id: str,
    participant_data: ParticipantCreate,
    current_user_email: str = Depends(get_current_user),
):
    """Update a participant in a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Update participant in trip
    result = await trips_collection.update_one(
        {
            "_id": ObjectId(trip_id),
            "user_id": current_user_email,
            "participants.id": participant_id,
        },
        {
            "$set": {
                "participants.$.name": participant_data.name,
                "participants.$.email": participant_data.email,
                "participants.$.initial_contribution": participant_data.initial_contribution,
                "participants.$.total_contributed": participant_data.initial_contribution,
                "participants.$.payment_method": participant_data.payment_method
                or "cash",
                "updated_at": datetime.now(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip or participant not found")

    # Create updated participant doc for response
    updated_participant = {
        "id": participant_id,
        "name": participant_data.name,
        "email": participant_data.email,
        "initial_contribution": participant_data.initial_contribution,
        "total_contributed": participant_data.initial_contribution,
        "payment_method": participant_data.payment_method or "cash",
    }

    return {
        "message": "Participant updated successfully",
        "participant": updated_participant,
    }


@router.post("/{trip_id}/transactions")
async def add_transaction(
    trip_id: str,
    transaction_data: TransactionCreate,
    current_user_email: str = Depends(get_current_user),
):
    """Add a transaction to a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Get the trip first
    trip = await trips_collection.find_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    participant_id = None

    # Handle new participant creation if needed
    if transaction_data.participant_data:
        participant_id = str(ObjectId())
        participant_doc = {
            "id": participant_id,
            "name": transaction_data.participant_data["name"],
            "email": transaction_data.participant_data.get("email", ""),
            "initial_contribution": transaction_data.participant_data.get(
                "initial_contribution", 0.0
            ),
            "total_contributed": transaction_data.participant_data.get(
                "initial_contribution", 0.0
            ),
            "payment_method": transaction_data.participant_data.get(
                "payment_method", "cash"
            ),
        }

        # Add new participant to trip
        await trips_collection.update_one(
            {"_id": ObjectId(trip_id)}, {"$push": {"participants": participant_doc}}
        )
    elif transaction_data.participant_id:
        participant_id = transaction_data.participant_id

    # Create transaction document
    transaction_doc = {
        "id": str(ObjectId()),
        "type": transaction_data.type,
        "amount": transaction_data.amount,
        "description": transaction_data.description,
        "category": transaction_data.category,
        "date": datetime.now(),
        "added_by": current_user_email,
        "paid_by": transaction_data.paid_by,
        "participant_id": participant_id,
    }

    # Update operations
    update_operations = {
        "$push": {"transactions": transaction_doc},
        "$set": {"updated_at": datetime.now()},
    }

    # If this is a participant contribution OR out-of-pocket expense, update their total_contributed
    if (
        transaction_data.type == "participant_contribution"
        or transaction_data.type == "participant_outofpocket"
    ) and participant_id:
        update_operations["$inc"] = {
            "participants.$[elem].total_contributed": transaction_data.amount
        }

        # Add transaction to trip with participant contribution update
        result = await trips_collection.update_one(
            {"_id": ObjectId(trip_id), "user_id": current_user_email},
            update_operations,
            array_filters=[{"elem.id": participant_id}],
        )
    else:
        # Regular leader expense transaction
        result = await trips_collection.update_one(
            {"_id": ObjectId(trip_id), "user_id": current_user_email}, update_operations
        )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    return {"message": "Transaction added successfully", "transaction": transaction_doc}


@router.delete("/{trip_id}/transactions/{transaction_id}")
async def delete_transaction(
    trip_id: str,
    transaction_id: str,
    current_user_email: str = Depends(get_current_user),
):
    """Delete a transaction from a trip"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Get the trip and transaction first
    trip = await trips_collection.find_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Find the transaction to delete
    transaction_to_delete = None
    for transaction in trip.get("transactions", []):
        if transaction.get("id") == transaction_id:
            transaction_to_delete = transaction
            break

    if not transaction_to_delete:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # If it's a participant contribution OR out-of-pocket expense, we need to update the participant's total_contributed
    if (
        transaction_to_delete.get("type") == "participant_contribution"
        or transaction_to_delete.get("type") == "participant_outofpocket"
    ) and transaction_to_delete.get("participant_id"):
        participant_id = transaction_to_delete["participant_id"]
        amount = transaction_to_delete["amount"]

        # First, calculate what the new total_contributed should be
        participant_data = None
        for participant in trip.get("participants", []):
            if participant.get("id") == participant_id:
                participant_data = participant
                break

        if participant_data:
            current_total = participant_data.get("total_contributed", 0)
            new_total = max(0, current_total - amount)  # Prevent negative values

            # Remove the transaction and update participant's total_contributed
            result = await trips_collection.update_one(
                {"_id": ObjectId(trip_id), "user_id": current_user_email},
                {
                    "$pull": {"transactions": {"id": transaction_id}},
                    "$set": {
                        "participants.$[elem].total_contributed": new_total,
                        "updated_at": datetime.now(),
                    },
                },
                array_filters=[{"elem.id": participant_id}],
            )
        else:
            # If participant not found, just remove the transaction
            result = await trips_collection.update_one(
                {"_id": ObjectId(trip_id), "user_id": current_user_email},
                {
                    "$pull": {"transactions": {"id": transaction_id}},
                    "$set": {"updated_at": datetime.now()},
                },
            )
    else:
        # Regular leader expense transaction - just remove it
        result = await trips_collection.update_one(
            {"_id": ObjectId(trip_id), "user_id": current_user_email},
            {
                "$pull": {"transactions": {"id": transaction_id}},
                "$set": {"updated_at": datetime.now()},
            },
        )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")

    return {"message": "Transaction deleted successfully"}


@router.post("/{trip_id}/fix-data-consistency")
async def fix_data_consistency(
    trip_id: str, current_user_email: str = Depends(get_current_user)
):
    """Fix data consistency issues in trip participant contributions"""

    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Get the trip
    trip = await trips_collection.find_one(
        {"_id": ObjectId(trip_id), "user_id": current_user_email}
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Calculate correct total_contributed for each participant
    updates = []
    for participant in trip.get("participants", []):
        participant_id = participant.get("id")
        initial_contribution = participant.get("initial_contribution", 0)

        # Calculate total from transactions
        contribution_from_transactions = 0
        for transaction in trip.get("transactions", []):
            if transaction.get("participant_id") == participant_id and transaction.get(
                "type"
            ) in ["participant_contribution", "participant_outofpocket"]:
                contribution_from_transactions += transaction.get("amount", 0)

        # Correct total should be initial + transaction contributions
        correct_total = initial_contribution + contribution_from_transactions
        current_total = participant.get("total_contributed", 0)

        if current_total != correct_total:
            updates.append(
                {
                    "participant_id": participant_id,
                    "name": participant.get("name"),
                    "current_total": current_total,
                    "correct_total": correct_total,
                    "difference": correct_total - current_total,
                }
            )

    # Apply corrections
    if updates:
        for update in updates:
            await trips_collection.update_one(
                {"_id": ObjectId(trip_id), "user_id": current_user_email},
                {
                    "$set": {
                        "participants.$[elem].total_contributed": update[
                            "correct_total"
                        ],
                        "updated_at": datetime.now(),
                    }
                },
                array_filters=[{"elem.id": update["participant_id"]}],
            )

    return {
        "message": "Data consistency check completed",
        "updates_applied": len(updates),
        "corrections": updates,
    }
