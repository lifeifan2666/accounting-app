from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Optional
from app.database import get_db
from app.models.transaction import Transaction
from app.models.account import Category
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/weekly")
def get_weekly_report(
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的周报表数据"""
    # 默认从本周一开始
    if not start_date:
        today = date.today()
        start_date = today - timedelta(days=today.weekday())

    end_date = start_date + timedelta(days=6)

    # 获取本周当前用户的所有交易
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()

    # 计算总收入和总支出
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expense

    # 按分类统计支出
    category_stats = {}
    for t in transactions:
        if t.type == "expense":
            cat_id = t.category_id
            if cat_id not in category_stats:
                category = db.query(Category).filter(
                    Category.id == cat_id,
                    Category.user_id == current_user.id
                ).first()
                category_stats[cat_id] = {
                    "category_id": cat_id,
                    "category_name": category.name if category else "未分类",
                    "amount": 0
                }
            category_stats[cat_id]["amount"] += t.amount

    # 计算百分比并排序
    category_list = list(category_stats.values())
    for cat in category_list:
        cat["percentage"] = round(cat["amount"] / total_expense * 100, 1) if total_expense > 0 else 0
    category_list.sort(key=lambda x: x["amount"], reverse=True)

    # 按天统计
    daily_stats = []
    weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        day_transactions = [t for t in transactions if t.date == current_date]
        day_income = sum(t.amount for t in day_transactions if t.type == "income")
        day_expense = sum(t.amount for t in day_transactions if t.type == "expense")

        daily_stats.append({
            "date": str(current_date),
            "weekday": weekdays[i],
            "income": day_income,
            "expense": day_expense
        })

    return {
        "start_date": str(start_date),
        "end_date": str(end_date),
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "category_breakdown": category_list,
        "daily_breakdown": daily_stats
    }
