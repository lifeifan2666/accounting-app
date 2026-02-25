from pydantic import BaseModel
from typing import Optional


class RecurringTransactionBase(BaseModel):
    account_id: int
    category_id: int
    amount: float
    type: str
    note: Optional[str] = None
    frequency: str = "monthly"  # daily, weekly, monthly, yearly
    day_of_month: Optional[int] = None
    day_of_week: Optional[int] = None
    is_active: bool = True


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    note: Optional[str] = None
    frequency: Optional[str] = None
    day_of_month: Optional[int] = None
    day_of_week: Optional[int] = None
    is_active: Optional[bool] = None


class RecurringTransactionResponse(RecurringTransactionBase):
    id: int
    account_name: Optional[str] = None
    category_name: Optional[str] = None
    last_created: Optional[str] = None

    class Config:
        from_attributes = True
