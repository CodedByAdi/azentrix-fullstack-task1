from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), index=True) # "income" or "expense"
    amount = Column(Float, nullable=False)
    category = Column(String(100), index=True)
    date = Column(Date, nullable=False)
    description = Column(String(255), nullable=True)
