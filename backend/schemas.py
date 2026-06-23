from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionBase(BaseModel):
    type: str
    amount: float
    category: str
    date: date
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        orm_mode = True

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    expense_by_category: dict[str, float]
