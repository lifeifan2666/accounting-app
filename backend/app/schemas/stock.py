from pydantic import BaseModel
from typing import Optional
from datetime import date


class StockTradeBase(BaseModel):
    symbol: str
    name: str
    type: str  # buy, sell
    price: float
    quantity: int
    fee: float = 0.0
    date: date


class StockTradeCreate(StockTradeBase):
    pass


class StockTradeUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    fee: Optional[float] = None
    date: Optional[date] = None


class StockTradeResponse(StockTradeBase):
    id: int

    class Config:
        from_attributes = True


class StockHolding(BaseModel):
    symbol: str
    name: str
    quantity: int
    cost_price: float
    total_cost: float


class StockProfit(BaseModel):
    symbol: str
    name: str
    realized_profit: float  # 已实现盈亏
    unrealized_profit: float  # 未实现盈亏 (需要当前价格计算)
    total_trades: int
