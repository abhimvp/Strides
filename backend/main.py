# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.database import client  # Import the mongodb client


# --- Lifespan Manager for Database Connection ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code here runs on startup
    print("Connecting to the database...")
    try:
        await client.admin.command("ping")
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

    yield  # The application runs here

    # Code here runs on shutdown
    print("Closing the database connection...")
    client.close()
    print("Database connection closed.")


# Create the FastAPI app instance with the lifespan manager
app = FastAPI(lifespan=lifespan)


# --- CORS Middleware ---
# This is crucial for allowing your React frontend
# to communicate with this backend.
origins = [
    "http://localhost:5173",  # The default port for Vite React dev server
    "http://12-7.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Routes ---
# A simple route to check if the backend is running
@app.get("/")
async def root():
    return {"message": "Strides backend is running!"}


# In the future, we will include our routes from the /routes folder here
# from routes import auth, tasks
# app.include_router(auth.router)
# app.include_router(tasks.router)
