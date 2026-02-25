from pydantic import BaseModel
from typing import Optional


class ReminderBase(BaseModel):
    name: str
    amount: float
    type: str
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    reminder_date: str
    repeat_type: str = "none"  # none, monthly, yearly
    is_active: bool = True


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    reminder_date: Optional[str] = None
    repeat_type: Optional[str] = None
    is_active: Optional[bool] = None


class ReminderResponse(ReminderBase):
    id: int
    category_name: Optional[str] = None
    account_name: Optional[str] = None

    class Config:
        from_attributes = True
