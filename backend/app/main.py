from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import accounts, transactions, stocks, budgets, recurring, reminders, reports, tags, auth

app = FastAPI(
    title="Accounting App API",
    description="Personal accounting and stock tracking API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(accounts.category_router, prefix="/api/categories", tags=["categories"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(recurring.router, prefix="/api/recurring", tags=["recurring"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
def root():
    return {"message": "Accounting App API", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
