from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.transaction import Transaction
from app.models.account import Account, Category
from app.models.tag import Tag
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse
)
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


def format_transaction_response(t: Transaction) -> dict:
    """格式化交易记录响应"""
    return {
        "id": t.id,
        "account_id": t.account_id,
        "category_id": t.category_id,
        "amount": t.amount,
        "type": t.type,
        "date": t.date,
        "note": t.note,
        "account_name": t.account.name if t.account else None,
        "category_name": t.category.name if t.category else None,
        "tags": [{"id": tag.id, "name": tag.name, "color": tag.color} for tag in t.tags]
    }


@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    tag_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的交易记录，支持多种筛选条件"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if tag_id:
        query = query.filter(Transaction.tags.any(Tag.id == tag_id))

    transactions = query.order_by(Transaction.date.desc()).all()

    return [format_transaction_response(t) for t in transactions]


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单条交易记录"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="交易记录不存在")

    return format_transaction_response(transaction)


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建交易记录，同时更新账户余额"""
    # 验证账户存在且属于当前用户
    account = db.query(Account).filter(
        Account.id == transaction.account_id,
        Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=400, detail="账户不存在")

    # 验证分类存在且属于当前用户
    category = db.query(Category).filter(
        Category.id == transaction.category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")

    # 获取标签（只获取当前用户的标签）
    tag_ids = transaction.tag_ids or []
    tags = db.query(Tag).filter(
        Tag.id.in_(tag_ids),
        Tag.user_id == current_user.id
    ).all() if tag_ids else []

    # 创建交易记录（不包含tag_ids）
    trans_data = transaction.model_dump(exclude={'tag_ids'})
    db_transaction = Transaction(**trans_data, user_id=current_user.id)
    db_transaction.tags = tags
    db.add(db_transaction)

    # 更新账户余额
    if transaction.type == "income":
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount

    db.commit()
    db.refresh(db_transaction)

    return format_transaction_response(db_transaction)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新交易记录"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="交易记录不存在")

    old_amount = db_transaction.amount
    old_type = db_transaction.type
    old_account_id = db_transaction.account_id

    update_data = transaction.model_dump(exclude_unset=True)

    # 处理标签更新
    if "tag_ids" in update_data:
        tag_ids = update_data.pop("tag_ids")
        if tag_ids is not None:
            tags = db.query(Tag).filter(
                Tag.id.in_(tag_ids),
                Tag.user_id == current_user.id
            ).all()
            db_transaction.tags = tags

    # 如果修改了金额、类型或账户，需要调整余额
    if any(k in update_data for k in ["amount", "type", "account_id"]):
        # 先撤销原交易对余额的影响
        old_account = db.query(Account).filter(Account.id == old_account_id).first()
        if old_type == "income":
            old_account.balance -= old_amount
        else:
            old_account.balance += old_amount

        # 更新交易记录
        for key, value in update_data.items():
            setattr(db_transaction, key, value)

        # 应用新交易对余额的影响
        new_account_id = update_data.get("account_id", old_account_id)
        new_account = db.query(Account).filter(
            Account.id == new_account_id,
            Account.user_id == current_user.id
        ).first()
        if not new_account:
            raise HTTPException(status_code=400, detail="账户不存在")

        new_type = update_data.get("type", old_type)
        new_amount = update_data.get("amount", old_amount)

        if new_type == "income":
            new_account.balance += new_amount
        else:
            new_account.balance -= new_amount
    else:
        for key, value in update_data.items():
            setattr(db_transaction, key, value)

    db.commit()
    db.refresh(db_transaction)

    return format_transaction_response(db_transaction)


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除交易记录，同时回滚账户余额"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="交易记录不存在")

    # 回滚账户余额
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if account:
        if transaction.type == "income":
            account.balance -= transaction.amount
        else:
            account.balance += transaction.amount

    db.delete(transaction)
    db.commit()
    return {"message": "交易记录已删除"}


@router.get("/summary/stats")
def get_transaction_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的交易统计"""
    from sqlalchemy import func

    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    transactions = query.all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "transaction_count": len(transactions)
    }


@router.get("/frequent-categories")
def get_frequent_categories(
    type: Optional[str] = None,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户最近30天最常用的分类"""
    from sqlalchemy import func
    from datetime import timedelta

    # 计算30天前的日期
    thirty_days_ago = date.today() - timedelta(days=30)

    # 构建查询
    query = db.query(
        Transaction.category_id,
        func.count(Transaction.id).label('count')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= thirty_days_ago
    )

    # 按类型筛选
    if type:
        query = query.filter(Transaction.type == type)

    # 分组并排序
    query = query.group_by(Transaction.category_id).order_by(
        func.count(Transaction.id).desc()
    ).limit(limit)

    results = query.all()

    # 获取分类详情（只获取当前用户的分类）
    categories = []
    for row in results:
        category = db.query(Category).filter(
            Category.id == row.category_id,
            Category.user_id == current_user.id
        ).first()
        if category:
            categories.append({
                "id": category.id,
                "name": category.name,
                "type": category.type,
                "count": row.count
            })

    return categories
