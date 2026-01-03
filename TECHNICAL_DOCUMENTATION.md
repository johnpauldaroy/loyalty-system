# Technical Documentation: QR-Based Loyalty Points System

## 1. System Overview
The QR-Based Loyalty Points System is a robust, role-based platform designed for financial cooperatives. It enables members to earn and redeem points through secure QR code interactions.

### Technology Stack
- **Backend**: Laravel 10+, MySQL 8.0, JWT (Tymon/jwt-auth)
- **Frontend**: React 19, Vite 5, Ant Design 5, Recharts
- **Communication**: RESTful API (V1)

---

## 2. Architecture & Design

### 2.1 Backend Architecture
The backend follows a service-oriented architecture:
- **Models**: Defines the data layer (Members, Transactions, Rules, etc.)
- **Controllers**: Handles API requests and response formatting via `ApiController`.
- **Services**: Contains the core business logic (Points Engine, QR Security, Fraud Scoring).
- **Middleware**: Manages Authentication and Role-Based Access Control (RBAC).

### 2.2 QR Security Workflow
Security is built into the QR payload to prevent tampering and replay attacks.
1.  **Generation**: The system generates an HMAC-signed JSON payload.
2.  **Signature**: `hash_hmac('sha256', data, QR_SECRET)`
3.  **Validation**: Staff scanners verify the `checksum`, `issued_at`, and `expires_at` before processing.

### 2.3 Points Calculation Engine
Points are not hardcoded; they are evaluated dynamically using configured rules.
- **Rules**: Criteria based on transaction category and amount.
- **Priority**: Higher priority rules are checked first.

---

## 3. Database Schema

| Table | Description |
| :--- | :--- |
| `users` | Auth accounts with roles (admin, staff, member). |
| `members` | Profile information; linked to a `User` for login. |
| `loyalty_points` | Current balance for each member. |
| `categories` | Transaction types (e.g., Deposit, Loan Payment). |
| `point_rules` | Logical rules for calculating points. |
| `transactions` | Immutable log of all point activities. |
| `audit_logs` | System-wide audit trail for critical actions. |
| `branches` | Cooperative branch locations. |

---

## 4. API Reference

### 4.1 Authentication
- `POST /v1/auth/login`: Authenticate and receive JWT.
- `GET /v1/auth/me`: Get current user details.

### 4.2 Member & QR
- `GET /v1/members/{id}/qr`: Generate signed QR payload (Member/Staff).
- `POST /v1/scan`: Process a transaction via QR scan (Staff/Admin).
- `GET /v1/members/{id}/transactions`: View member history (Member/Admin).

### 4.3 Admin Operations
- `GET /v1/dashboard/stats`: Aggregated analytics data.
- `GET /v1/audit-logs`: View system audit trail.
- `CRUD /v1/branches`: Manage cooperative branches.

---

## 5. Deployment & Configuration

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0

### Key Environment Variables
```env
# Backend (.env)
JWT_SECRET=       # Secret for user tokens
QR_SECRET=        # Secret for QR code signing

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 6. Security Features
- **Immutable Logs**: Audit logs and transactions cannot be deleted or modified.
- **HMAC Signatures**: Prevents forged QR codes.
- **Role Isolation**: Members cannot access admin analytics or create transactions.
- **Rate Limiting**: Prevents brute-force on login and scanning.
