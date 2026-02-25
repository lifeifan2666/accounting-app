from pydantic import BaseModel
from typing import Optional


class BudgetBase(BaseModel):
    category_id: Optional[int] = None  # NULL for total budget
    amount: float
    period: str = "month"  # month or year
    year: int
    month: Optional[int] = None  # NULL for yearly budgets


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = None
    period: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None


class BudgetResponse(BudgetBase):
    id: int
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


class BudgetStatus(BaseModel):
    """预算状态，包含已用金额和剩余金额"""
    id: Optional[int] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = "总预算"
    budget_amount: float
    used_amount: float
    remaining_amount: float
    percentage: float  # 使用百分比
    period: str
    year: int
    month: Optional[int] = None
