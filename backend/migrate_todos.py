"""
Migration script to add missing timestamps to existing todos
Run this once to update existing data before deploying the new features
"""

import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()


async def migrate_todos():
    """Migrate existing todos to add missing timestamp fields"""

    # Connect to database
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DB_NAME", "strides_db")]

    print("Starting todo migration...")

    # Find todos missing createdAt field
    todos_missing_created = await db.todos.count_documents(
        {"createdAt": {"$exists": False}}
    )
    print(f"Found {todos_missing_created} todos missing createdAt field")

    if todos_missing_created > 0:
        # For existing todos without createdAt, we have a few options:

        # Option 1: Use ObjectId creation time as createdAt (most accurate for existing data)
        print("Migrating todos using ObjectId creation time...")
        async for todo in db.todos.find({"createdAt": {"$exists": False}}):
            # Extract creation time from ObjectId
            creation_time = todo["_id"].generation_time

            update_doc = {
                "createdAt": creation_time,
                # Don't set inProgressAt or completedAt for existing todos
                # unless you have specific logic to determine these
            }

            # If todo is already "In Progress" or "Done", you might want to estimate timestamps
            if todo.get("status") == "In Progress":
                # You could set inProgressAt to createdAt as a fallback
                # or leave it None to indicate we don't know when it started
                pass  # Leave inProgressAt as None for now

            if todo.get("status") == "Done":
                # Similar decision for completedAt
                pass  # Leave completedAt as None for now

            await db.todos.update_one({"_id": todo["_id"]}, {"$set": update_doc})

            print(
                f"Migrated todo: {todo.get('title', 'Untitled')} - Created: {creation_time}"
            )

    # Verify migration
    remaining_missing = await db.todos.count_documents(
        {"createdAt": {"$exists": False}}
    )
    print(f"Migration complete. {remaining_missing} todos still missing createdAt")

    # Show some sample migrated data
    sample_todos = await db.todos.find({}).limit(3).to_list(length=3)
    print("\nSample migrated todos:")
    for todo in sample_todos:
        print(f"- {todo.get('title')}: Created {todo.get('createdAt')}")

    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_todos())
