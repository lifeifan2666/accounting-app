from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from sqlalchemy import func
from app.database import get_db
from app.models.stock import StockTrade
from app.schemas.stock import (
    StockTradeCreate, StockTradeUpdate, StockTradeResponse,
    StockHolding, StockProfit
)
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[StockTradeResponse])
def get_stock_trades(
    symbol: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的股票交易记录，支持筛选"""
    query = db.query(StockTrade).filter(StockTrade.user_id == current_user.id)

    if symbol:
        query = query.filter(StockTrade.symbol == symbol)
    if type:
        query = query.filter(StockTrade.type == type)
    if start_date:
        query = query.filter(StockTrade.date >= start_date)
    if end_date:
        query = query.filter(StockTrade.date <= end_date)

    return query.order_by(StockTrade.date.desc()).all()


@router.get("/{trade_id}", response_model=StockTradeResponse)
def get_stock_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单条股票交易记录"""
    trade = db.query(StockTrade).filter(
        StockTrade.id == trade_id,
        StockTrade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="交易记录不存在")
    return trade


@router.post("/", response_model=StockTradeResponse)
def create_stock_trade(
    trade: StockTradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建股票交易记录"""
    db_trade = StockTrade(**trade.model_dump(), user_id=current_user.id)
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade


@router.put("/{trade_id}", response_model=StockTradeResponse)
def update_stock_trade(
    trade_id: int,
    trade: StockTradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新股票交易记录"""
    db_trade = db.query(StockTrade).filter(
        StockTrade.id == trade_id,
        StockTrade.user_id == current_user.id
    ).first()
    if not db_trade:
        raise HTTPException(status_code=404, detail="交易记录不存在")

    update_data = trade.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trade, key, value)

    db.commit()
    db.refresh(db_trade)
    return db_trade


@router.delete("/{trade_id}")
def delete_stock_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除股票交易记录"""
    trade = db.query(StockTrade).filter(
        StockTrade.id == trade_id,
        StockTrade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="交易记录不存在")

    db.delete(trade)
    db.commit()
    return {"message": "交易记录已删除"}


@router.get("/holdings/list", response_model=List[StockHolding])
def get_stock_holdings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的持仓"""
    # 获取当前用户的所有交易记录
    trades = db.query(StockTrade).filter(
        StockTrade.user_id == current_user.id
    ).order_by(StockTrade.date.asc()).all()

    # 按股票代码分组计算持仓
    holdings = {}

    for trade in trades:
        symbol = trade.symbol
        if symbol not in holdings:
            holdings[symbol] = {
                "symbol": symbol,
                "name": trade.name,
                "quantity": 0,
                "total_cost": 0.0
            }

        if trade.type == "buy":
            holdings[symbol]["quantity"] += trade.quantity
            holdings[symbol]["total_cost"] += trade.price * trade.quantity + trade.fee
        else:  # sell
            if holdings[symbol]["quantity"] > 0:
                # 计算卖出时的平均成本
                avg_cost = holdings[symbol]["total_cost"] / holdings[symbol]["quantity"]
                cost_of_sold = avg_cost * trade.quantity
                holdings[symbol]["total_cost"] -= cost_of_sold
            holdings[symbol]["quantity"] -= trade.quantity
            holdings[symbol]["total_cost"] -= trade.fee  # 卖出手续费从成本中扣除

    # 只返回还有持仓的股票
    result = []
    for h in holdings.values():
        if h["quantity"] > 0:
            h["cost_price"] = round(h["total_cost"] / h["quantity"], 4)
            result.append(StockHolding(**h))

    return result


@router.get("/profits/list", response_model=List[StockProfit])
def get_stock_profits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户各股票的盈亏情况"""
    trades = db.query(StockTrade).filter(
        StockTrade.user_id == current_user.id
    ).order_by(StockTrade.date.asc()).all()

    # 按股票代码分组
    stocks = {}

    for trade in trades:
        symbol = trade.symbol
        if symbol not in stocks:
            stocks[symbol] = {
                "symbol": symbol,
                "name": trade.name,
                "realized_profit": 0.0,
                "holdings": []  # 用于计算持仓成本
            }

        if trade.type == "buy":
            # 买入：加入持仓队列
            for _ in range(trade.quantity):
                stocks[symbol]["holdings"].append(trade.price)
        else:
            # 卖出：计算已实现盈亏
            for _ in range(trade.quantity):
                if stocks[symbol]["holdings"]:
                    cost = stocks[symbol]["holdings"].pop(0)
                    stocks[symbol]["realized_profit"] += trade.price - cost
            stocks[symbol]["realized_profit"] -= trade.fee

    result = []
    for s in stocks.values():
        remaining_quantity = len(s["holdings"])
        # 未实现盈亏需要当前价格，这里暂时设为0（需要接入行情API）
        unrealized_profit = 0.0

        result.append(StockProfit(
            symbol=s["symbol"],
            name=s["name"],
            realized_profit=round(s["realized_profit"], 2),
            unrealized_profit=unrealized_profit,
            total_trades=sum(1 for t in trades if t.symbol == s["symbol"])
        ))

    return result
