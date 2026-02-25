from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.tag import transaction_tags


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # income, expense
    date = Column(Date, nullable=False)
    note = Column(String, default="")

    user = relationship("User", backref="transactions")
    account = relationship("Account", foreign_keys=[account_id])
    category = relationship("Category", foreign_keys=[category_id])
    tags = relationship("Tag", secondary=transaction_tags, backref="transactions")
