# backend/utils/database.py
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Motor, an asynchronous driver for MongoDB

# Load environment variables from .env file
load_dotenv()

MONGO_DB_URL = os.getenv("MONGO_DB_URL")

# Create a database client instance
client = AsyncIOMotorClient(MONGO_DB_URL)

# Get a reference to the database
# You can name your database anything you like
database = client.strides_db

async def get_database():
    """Dependency function to get the database instance."""
    return database

# You can also get a reference to a specific collection
# For example, to a 'users' collection
# user_collection = database.get_collection("users")
