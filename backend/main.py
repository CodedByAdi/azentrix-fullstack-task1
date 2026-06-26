from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
from database import engine, get_db

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Budget Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/transactions", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).order_by(models.Transaction.date.desc(), models.Transaction.id.desc()).offset(skip).limit(limit).all()
    return transactions

@app.post("/api/transactions", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.model_dump() if hasattr(transaction, "model_dump") else transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.put("/api/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = transaction.model_dump() if hasattr(transaction, "model_dump") else transaction.dict()
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"ok": True}

@app.get("/api/dashboard", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expense
    savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0
    
    expense_by_category = {}
    for t in transactions:
        if t.type == "expense":
            expense_by_category[t.category] = expense_by_category.get(t.category, 0) + t.amount

    # Monthly breakdown for bar chart
    monthly_map = {}
    for t in transactions:
        month_key = t.date.strftime("%b %Y")
        if month_key not in monthly_map:
            monthly_map[month_key] = {"month": month_key, "income": 0, "expense": 0}
        if t.type == "income":
            monthly_map[month_key]["income"] += t.amount
        else:
            monthly_map[month_key]["expense"] += t.amount
    monthly_data = list(monthly_map.values())

    # Recent transactions (latest 5)
    recent = db.query(models.Transaction).order_by(models.Transaction.date.desc(), models.Transaction.id.desc()).limit(5).all()
            
    return schemas.DashboardSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        savings_rate=round(savings_rate, 1),
        expense_by_category=expense_by_category,
        monthly_data=monthly_data,
        recent_transactions=recent
    )
