from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.reminder import Reminder
from app.models.account import Account, Category
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse
)
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的所有账单提醒"""
    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id
    ).all()

    result = []
    for r in reminders:
        r_dict = {
            "id": r.id,
            "name": r.name,
            "amount": r.amount,
            "type": r.type,
            "category_id": r.category_id,
            "account_id": r.account_id,
            "reminder_date": r.reminder_date,
            "repeat_type": r.repeat_type,
            "is_active": r.is_active,
            "category_name": r.category.name if r.category else None,
            "account_name": r.account.name if r.account else None
        }
        result.append(r_dict)

    return result


@router.post("/", response_model=ReminderResponse)
def create_reminder(
    reminder: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建账单提醒"""
    # 验证分类存在且属于当前用户（如果指定）
    category_name = None
    if reminder.category_id:
        category = db.query(Category).filter(
            Category.id == reminder.category_id,
            Category.user_id == current_user.id
        ).first()
        if not category:
            raise HTTPException(status_code=400, detail="分类不存在")
        category_name = category.name

    # 验证账户存在且属于当前用户（如果指定）
    account_name = None
    if reminder.account_id:
        account = db.query(Account).filter(
            Account.id == reminder.account_id,
            Account.user_id == current_user.id
        ).first()
        if not account:
            raise HTTPException(status_code=400, detail="账户不存在")
        account_name = account.name

    db_reminder = Reminder(**reminder.model_dump(), user_id=current_user.id)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)

    return {
        "id": db_reminder.id,
        "name": db_reminder.name,
        "amount": db_reminder.amount,
        "type": db_reminder.type,
        "category_id": db_reminder.category_id,
        "account_id": db_reminder.account_id,
        "reminder_date": db_reminder.reminder_date,
        "repeat_type": db_reminder.repeat_type,
        "is_active": db_reminder.is_active,
        "category_name": category_name,
        "account_name": account_name
    }


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新账单提醒"""
    db_reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not db_reminder:
        raise HTTPException(status_code=404, detail="账单提醒不存在")

    update_data = reminder.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reminder, key, value)

    db.commit()
    db.refresh(db_reminder)

    return {
        "id": db_reminder.id,
        "name": db_reminder.name,
        "amount": db_reminder.amount,
        "type": db_reminder.type,
        "category_id": db_reminder.category_id,
        "account_id": db_reminder.account_id,
        "reminder_date": db_reminder.reminder_date,
        "repeat_type": db_reminder.repeat_type,
        "is_active": db_reminder.is_active,
        "category_name": db_reminder.category.name if db_reminder.category else None,
        "account_name": db_reminder.account.name if db_reminder.account else None
    }


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除账单提醒"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="账单提醒不存在")

    db.delete(reminder)
    db.commit()
    return {"message": "账单提醒已删除"}
