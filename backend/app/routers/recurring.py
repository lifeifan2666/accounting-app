from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.recurring import RecurringTransaction
from app.models.account import Account, Category
from app.schemas.recurring import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionResponse
)
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[RecurringTransactionResponse])
def get_recurring_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的所有周期交易"""
    recurring = db.query(RecurringTransaction).filter(
        RecurringTransaction.user_id == current_user.id
    ).all()

    result = []
    for r in recurring:
        r_dict = {
            "id": r.id,
            "account_id": r.account_id,
            "category_id": r.category_id,
            "amount": r.amount,
            "type": r.type,
            "note": r.note,
            "frequency": r.frequency,
            "day_of_month": r.day_of_month,
            "day_of_week": r.day_of_week,
            "is_active": r.is_active,
            "last_created": r.last_created,
            "account_name": r.account.name if r.account else None,
            "category_name": r.category.name if r.category else None
        }
        result.append(r_dict)

    return result


@router.post("/", response_model=RecurringTransactionResponse)
def create_recurring_transaction(
    recurring: RecurringTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建周期交易"""
    # 验证账户存在且属于当前用户
    account = db.query(Account).filter(
        Account.id == recurring.account_id,
        Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=400, detail="账户不存在")

    # 验证分类存在且属于当前用户
    category = db.query(Category).filter(
        Category.id == recurring.category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")

    db_recurring = RecurringTransaction(**recurring.model_dump(), user_id=current_user.id)
    db.add(db_recurring)
    db.commit()
    db.refresh(db_recurring)

    return {
        "id": db_recurring.id,
        "account_id": db_recurring.account_id,
        "category_id": db_recurring.category_id,
        "amount": db_recurring.amount,
        "type": db_recurring.type,
        "note": db_recurring.note,
        "frequency": db_recurring.frequency,
        "day_of_month": db_recurring.day_of_month,
        "day_of_week": db_recurring.day_of_week,
        "is_active": db_recurring.is_active,
        "last_created": db_recurring.last_created,
        "account_name": account.name,
        "category_name": category.name
    }


@router.put("/{recurring_id}", response_model=RecurringTransactionResponse)
def update_recurring_transaction(
    recurring_id: int,
    recurring: RecurringTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新周期交易"""
    db_recurring = db.query(RecurringTransaction).filter(
        RecurringTransaction.id == recurring_id,
        RecurringTransaction.user_id == current_user.id
    ).first()

    if not db_recurring:
        raise HTTPException(status_code=404, detail="周期交易不存在")

    update_data = recurring.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_recurring, key, value)

    db.commit()
    db.refresh(db_recurring)

    return {
        "id": db_recurring.id,
        "account_id": db_recurring.account_id,
        "category_id": db_recurring.category_id,
        "amount": db_recurring.amount,
        "type": db_recurring.type,
        "note": db_recurring.note,
        "frequency": db_recurring.frequency,
        "day_of_month": db_recurring.day_of_month,
        "day_of_week": db_recurring.day_of_week,
        "is_active": db_recurring.is_active,
        "last_created": db_recurring.last_created,
        "account_name": db_recurring.account.name if db_recurring.account else None,
        "category_name": db_recurring.category.name if db_recurring.category else None
    }


@router.delete("/{recurring_id}")
def delete_recurring_transaction(
    recurring_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除周期交易"""
    recurring = db.query(RecurringTransaction).filter(
        RecurringTransaction.id == recurring_id,
        RecurringTransaction.user_id == current_user.id
    ).first()

    if not recurring:
        raise HTTPException(status_code=404, detail="周期交易不存在")

    db.delete(recurring)
    db.commit()
    return {"message": "周期交易已删除"}
