# OptiSuite (OptiManager)

**A Full-Stack Enterprise Point of Sale (POS) & Management System for Optical Stores**

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20|%20Express%20|%20MySQL-orange)
![Architecture](https://img.shields.io/badge/Architecture-MVC-informational)

---

## 📌 Project Overview

**OptiSuite** is a robust, full-stack web application designed to digitize and streamline the operations of modern optical retail businesses. It functions as a complete **ERP + POS solution**, integrating:

- Inventory Management  
- Optical CRM & Prescription Tracking  
- Secure POS Billing  
- Advanced Sales Analytics  

Built with a strong emphasis on **data integrity**, **security**, and **scalability**, OptiSuite enables optical store owners to transition from manual bookkeeping to a reliable, real-time digital infrastructure.

---

## 🚀 Key Features

### 🔐 1. Role-Based Access Control (RBAC)
- **Admin Dashboard**
  - Full system access
  - Inventory & pricing control
  - Sales analytics & reports
  - User management
- **Employee Interface**
  - POS billing
  - Customer & prescription management
  - Restricted administrative access

---

### 📦 2. Advanced Inventory Management
- **Categorized Tracking**
  - Frames
  - Lenses
  - Contact Lenses
  - Sunglasses
  - Accessories
- **Real-Time Stock Updates**
  - Automatic stock deduction on successful sales
  - Powered by ACID-compliant MySQL transactions
- **Smart Search**
  - Filter products by barcode, brand, or name

---

### 👁 3. Optical-Specific CRM
- **Prescription Management**
  - OD / OS values for:
    - Sphere (SPH)
    - Cylinder (CYL)
    - Axis
    - Add
    - Pupillary Distance (PD)
- **Customer History**
  - Complete purchase & prescription records
- **Strict Validation**
  - 10-digit phone enforcement
  - Unique email constraints

---

### 💳 4. Point of Sale (POS) System
- **Dynamic Cart System**
  - Live price calculation
  - Multi-item billing
- **Lens Customization**
  - Support for coatings, fitting charges, and add-ons
- **Transaction Safety**
  - Sales are recorded **only if** inventory updates succeed
  - Ensures atomic operations (no partial sales)

---

### 📊 5. Analytics & Reporting
- **Interactive Dashboards**
  - Area & Doughnut charts via **ApexCharts.js**
- **AI-Inspired Insights**
  - Revenue Change %
  - Top-performing categories
- **Financial Metrics**
  - Daily revenue
  - Profit margin estimation
  - Best-selling products

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js  
- **Framework:** Express.js (RESTful API)  
- **Database:** MySQL (Relational model with foreign keys)  
- **Authentication:** JWT & bcryptjs  
- **Architecture:** MVC (Model–View–Controller)  

### Frontend
- **Core:** HTML5, CSS3, JavaScript (ES6+)  
- **Styling:** Tailwind CSS  
- **Icons:** Lucide Icons  
- **Charts:** ApexCharts.js  
- **Pattern:** Modular JS with Service Layer  

---

## 🧱 System Architecture

The project strictly follows the **MVC pattern** for scalability and maintainability.

```text
OptiSuite/
├── backend/
│   ├── config/         # Database connection pooling
│   ├── controllers/    # Business logic (Auth, Sales, Inventory)
│   ├── middleware/     # JWT verification & role guards
│   ├── models/         # SQL queries & validation
│   └── routes/         # REST API endpoints
│
├── frontend/
│   ├── js/             # API services & UI logic
│   ├── pages/          # HTML templates
│   └── index.html      # SPA entry point
│
└── database_schema.sql # Tables, constraints & relations
# Project Documentation
  ```
## 📂 Database & Structure
- **`database_schema.sql`**: Contains all tables, constraints, and entity relations.

---

## ⚙️ Installation & Setup

### Prerequisites
Ensure you have the following installed before running the project:
* **Node.js** (v14 or higher)
* **MySQL Server**
* **VS Code** (Recommended)

### Frontend Setup
1. Open the `frontend` folder in your editor.
2. Serve `index.html` using a static server (e.g., **VS Code Live Server** extension).
3. Access the application in your browser at:  
   👉 `http://127.0.0.1:5500`

---

## 🔐 API Documentation
**Key Endpoints**

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT | **Public** |
| **GET** | `/api/products` | Retrieve inventory list | **Public** |
| **POST** | `/api/sales` | Create sale (Atomic Transaction) | **Protected** |
| **GET** | `/api/sales/reports/full` | Get advanced analytics | **Protected** |
| **POST** | `/api/customers` | Add customer with prescription | **Admin Only** |

---

## 🛡️ Security Features

This application implements industry-standard security measures:

* **SQL Injection Protection:** All database queries utilize parameterized prepared statements (`?` syntax).
* **XSS Protection:** rigorous frontend sanitization of all user inputs.
* **Secure Authentication:** User passwords are hashed using **bcrypt**; API access is strictly controlled via **JWT** (JSON Web Tokens).
* **Input Validation:** Backend models strictly enforce data types (e.g., validating 10-digit phone numbers) before database insertion.

---

### 👨‍💻 Developed By
**Samarth Sanjay Khadse** *B.Tech Artificial Intelligence & Data Science*
