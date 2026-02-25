from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class TagInTransaction(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    account_id: int
    category_id: int
    amount: float
    type: str  # income, expense
    date: date
    note: str = ""


class TransactionCreate(TransactionBase):
    tag_ids: Optional[List[int]] = []


class TransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    date: Optional[date] = None
    note: Optional[str] = None
    tag_ids: Optional[List[int]] = None


class TransactionResponse(TransactionBase):
    id: int
    account_name: Optional[str] = None
    category_name: Optional[str] = None
    tags: List[TagInTransaction] = []

    class Config:
        from_attributes = True
