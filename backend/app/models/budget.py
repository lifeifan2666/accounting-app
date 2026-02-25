from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # NULL means total budget
    amount = Column(Float, nullable=False)
    period = Column(String, default="month")  # month or year
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=True)  # NULL for yearly budgets

    user = relationship("User", backref="budgets")
    category = relationship("Category", backref="budgets")
