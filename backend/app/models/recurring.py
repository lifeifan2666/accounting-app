from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # expense or income
    note = Column(String, nullable=True)
    frequency = Column(String, default="monthly")  # daily, weekly, monthly, yearly
    day_of_month = Column(Integer, nullable=True)  # for monthly: 1-31
    day_of_week = Column(Integer, nullable=True)  # for weekly: 0-6 (monday-sunday)
    is_active = Column(Boolean, default=True)
    last_created = Column(String, nullable=True)  # date of last created transaction

    user = relationship("User", backref="recurring_transactions")
    account = relationship("Account", backref="recurring_transactions")
    category = relationship("Category", backref="recurring_transactions")
