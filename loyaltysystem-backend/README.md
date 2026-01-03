# Loyalty System Backend

Production-ready API-only Laravel backend for QR-based Loyalty Points System.

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0+
- Node.js 18+ (for asset compilation)

### Installation

1. **Install Dependencies**
```bash
composer install
```

2. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure Database**

Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=loyalty_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create database:
```sql
CREATE DATABASE loyalty_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Run Migrations**
```bash
php artisan migrate
```

5. **Seed Database (Optional)**
```bash
php artisan db:seed
```

6. **Start Development Server**
```bash
php artisan serve
```

API will be available at: `http://localhost:8000`

---

## Project Structure

See [STRUCTURE.md](STRUCTURE.md) for detailed folder organization and naming conventions.

---

## API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

### Endpoints

#### Authentication
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout

#### QR Operations
- `POST /api/v1/scan` - Process QR scan
- `GET /api/v1/members/{id}/qr` - Generate member QR code

#### Members
- `GET /api/v1/members/{id}` - Get member details
- `GET /api/v1/members/{id}/points` - Get points balance
- `GET /api/v1/members/{id}/transactions` - Get transaction history

#### Admin (Requires admin role)
- `GET|POST /api/v1/categories` - Manage categories
- `GET|POST|PUT|DELETE /api/v1/point-rules` - Manage point rules
- `GET|POST|PUT|DELETE /api/v1/rewards` - Manage rewards
- `GET /api/v1/audit-logs` - View audit logs

---

## Development

### Create New Controller
```bash
php artisan make:controller Api/V1/ExampleController --api
```

### Create New Model
```bash
php artisan make:model Example -m
```

### Create New Service
```bash
php artisan make:class Services/ExampleService
```

### Create New Middleware
```bash
php artisan make:middleware ExampleMiddleware
```

### Run Tests
```bash
php artisan test
```

---

## Environment Variables

### Required Variables

```env
# Application
APP_NAME="Loyalty System API"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=loyalty_system
DB_USERNAME=root
DB_PASSWORD=

# JWT (to be configured)
JWT_SECRET=
JWT_TTL=1440

# QR Security
QR_SECRET=
QR_EXPIRY_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Security

- ✅ All routes require authentication
- ✅ Role-based access control
- ✅ HMAC-signed QR codes
- ✅ Input validation on all requests
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Audit logging for all mutations

---

## License

Proprietary - Financial Cooperative Internal Use Only
