from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # expense or income
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    reminder_date = Column(String, nullable=False)  # YYYY-MM-DD format
    repeat_type = Column(String, default="none")  # none, monthly, yearly
    is_active = Column(Boolean, default=True)

    user = relationship("User", backref="reminders")
    category = relationship("Category", backref="reminders")
    account = relationship("Account", backref="reminders")
