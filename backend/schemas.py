from pydantic import BaseModel
from datetime import date
from typing import Optional, List

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

    model_config = {"from_attributes": True}

class MonthlyBreakdown(BaseModel):
    month: str
    income: float
    expense: float

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    savings_rate: float
    expense_by_category: dict[str, float]
    monthly_data: List[MonthlyBreakdown]
    recent_transactions: List[Transaction]
