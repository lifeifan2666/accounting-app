from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.account import Category
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus
)
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的预算列表"""
    query = db.query(Budget).filter(Budget.user_id == current_user.id)

    if year:
        query = query.filter(Budget.year == year)
    if month:
        query = query.filter(Budget.month == month)

    budgets = query.all()

    result = []
    for b in budgets:
        b_dict = {
            "id": b.id,
            "category_id": b.category_id,
            "amount": b.amount,
            "period": b.period,
            "year": b.year,
            "month": b.month,
            "category_name": b.category.name if b.category else "总预算"
        }
        result.append(b_dict)

    return result


@router.get("/status", response_model=List[BudgetStatus])
def get_budget_status(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的预算状态（包含已用金额）"""
    from sqlalchemy import func

    today = date.today()
    target_year = year or today.year
    target_month = month or today.month

    # 获取当月所有预算（只获取当前用户的）
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.year == target_year,
        (Budget.month == target_month) | (Budget.month == None)
    ).all()

    result = []

    for budget in budgets:
        # 计算已用金额（只计算当前用户的交易）
        if budget.category_id:
            # 分类预算
            transactions = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.type == "expense",
                Transaction.category_id == budget.category_id,
                func.strftime('%Y', Transaction.date) == str(target_year),
                func.strftime('%m', Transaction.date) == f"{target_month:02d}"
            ).all()
        else:
            # 总预算
            transactions = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.type == "expense",
                func.strftime('%Y', Transaction.date) == str(target_year),
                func.strftime('%m', Transaction.date) == f"{target_month:02d}"
            ).all()

        used_amount = sum(t.amount for t in transactions)
        remaining_amount = budget.amount - used_amount
        percentage = (used_amount / budget.amount * 100) if budget.amount > 0 else 0

        result.append({
            "id": budget.id,
            "category_id": budget.category_id,
            "category_name": budget.category.name if budget.category else "总预算",
            "budget_amount": budget.amount,
            "used_amount": used_amount,
            "remaining_amount": remaining_amount,
            "percentage": min(percentage, 100),
            "period": budget.period,
            "year": budget.year,
            "month": budget.month
        })

    # 如果没有设置预算，返回默认的总预算状态
    if not budgets:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            func.strftime('%Y', Transaction.date) == str(target_year),
            func.strftime('%m', Transaction.date) == f"{target_month:02d}"
        ).all()
        used_amount = sum(t.amount for t in transactions)

        result.append({
            "id": None,
            "category_id": None,
            "category_name": "总预算",
            "budget_amount": 0,
            "used_amount": used_amount,
            "remaining_amount": -used_amount,
            "percentage": 0,
            "period": "month",
            "year": target_year,
            "month": target_month
        })

    return result


@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建预算"""
    # 检查是否已存在相同预算（只检查当前用户的）
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.year == budget.year,
        Budget.month == budget.month,
        Budget.category_id == budget.category_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="该预算已存在")

    db_budget = Budget(**budget.model_dump(), user_id=current_user.id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)

    return {
        "id": db_budget.id,
        "category_id": db_budget.category_id,
        "amount": db_budget.amount,
        "period": db_budget.period,
        "year": db_budget.year,
        "month": db_budget.month,
        "category_name": db_budget.category.name if db_budget.category else "总预算"
    }


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新预算"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="预算不存在")

    update_data = budget.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_budget, key, value)

    db.commit()
    db.refresh(db_budget)

    return {
        "id": db_budget.id,
        "category_id": db_budget.category_id,
        "amount": db_budget.amount,
        "period": db_budget.period,
        "year": db_budget.year,
        "month": db_budget.month,
        "category_name": db_budget.category.name if db_budget.category else "总预算"
    }


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除预算"""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="预算不存在")

    db.delete(budget)
    db.commit()
    return {"message": "预算已删除"}
