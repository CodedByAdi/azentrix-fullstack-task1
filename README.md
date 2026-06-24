# azentrix-fullstack-task1
Personal Budget Tracker Web App

> A full-stack Personal Budget Tracker built with React, FastAPI, and MySQL.

---

## Features

- **Transactions Management:** Add, edit, and delete income/expense entries.
- **Categorization:** Categorize your transactions (e.g., Rent, Food, Salary).
- **Dashboard Summary:** View your total income, expenses, and current balance.
- **Visual Analytics:** Interactive Pie chart showing a breakdown of expenses by category.
- **Responsive Design:** Fully responsive layout that works seamlessly on desktop and mobile devices.
- **Data Persistence:** Relational database storage using MySQL and SQLAlchemy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS v3, React Router DOM, Recharts, Lucide React |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| Database | MySQL 8 |
| HTTP Client | Axios |

---

## Architecture & Approach

This project follows a decoupled client-server architecture:
- **Frontend (React + Vite):** Uses a modern component-based UI. TailwindCSS is used to ensure a premium, fully responsive design with zero custom CSS clutter. `Recharts` provides lightweight, responsive SVG charts for data visualization.
- **Backend (FastAPI):** Chosen for its high performance and auto-generated Swagger documentation. The architecture is clean, using SQLAlchemy as an ORM to interact with the database.
- **Database (MySQL):** Ensures robust data persistence. SQLAlchemy abstracts the SQL layer, making it easy to swap databases if needed, but MySQL provides the relational integrity required for financial records.

---

## Setup Instructions

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **MySQL** Server running locally

### 1. Database Setup
Create the MySQL database for the project:
```sql
CREATE DATABASE budget_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
Navigate to the backend directory, set up the virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

*(Note: If `requirements.txt` is missing, you can install the dependencies via: `pip install fastapi uvicorn sqlalchemy pymysql python-dotenv pydantic`)*

Configure your `.env` file in the `backend` folder:
```env
# backend/.env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/budget_tracker
```

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The API runs at `http://localhost:8000`. Swagger docs are available at `http://localhost:8000/docs`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## Screenshots & Demo

| Dashboard | Transactions |
|---|---|
| ![Dashboard](frontend/public/Dashboard.png) | ![Transactions](frontend/public/Transactions.png) |

| New Transaction | Transaction History |
|---|---|
| ![New Transaction](frontend/public/new-transaction.png) | ![History](frontend/public/history.png) |

**Demo Video:** [Watch the Loom Walkthrough](https://www.loom.com/share/b4952c867da041f0a77d3be6a4f9140e)
