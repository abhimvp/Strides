# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.database import client  # Import the mongodb client
from routes import auth, tasks, agent, transactions, categories, todos, trips, accounts


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

# --- Include API Routers ---
app.include_router(
    auth.router, prefix="/api/auth", tags=["Authentication"]
)  # <--- INCLUDE THE ROUTER
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(agent.router, prefix="/api/agent", tags=["Agent"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(
    transactions.router, prefix="/api/transactions", tags=["Transactions"]
)  # Add this line
app.include_router(
    categories.router, prefix="/api/categories", tags=["Categories"]
)  # Add this line
# Add the new To-Do router
app.include_router(todos.router, prefix="/api/todos", tags=["Todos"])
# Add the new Trips router
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])


# --- API Routes ---
# A simple route to check if the backend is running
@app.get("/")
async def root():
    return {"message": "Strides backend is running!"}
