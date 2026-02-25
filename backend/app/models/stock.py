from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class StockTrade(Base):
    __tablename__ = "stock_trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String, nullable=False)  # 股票代码
    name = Column(String, nullable=False)  # 股票名称
    type = Column(String, nullable=False)  # buy, sell
    price = Column(Float, nullable=False)  # 成交价格
    quantity = Column(Integer, nullable=False)  # 成交数量
    fee = Column(Float, default=0.0)  # 手续费
    date = Column(Date, nullable=False)  # 交易日期

    user = relationship("User", backref="stock_trades")
