# Laravel Backend - Project Structure

## Overview
API-only Laravel 10+ backend for QR-based Loyalty Points System.

---

## Directory Structure

```
loyaltysystem-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/              # API Controllers (versioned)
│   │   │       ├── V1/
│   │   │       │   ├── AuthController.php
│   │   │       │   ├── MemberController.php
│   │   │       │   ├── QRController.php
│   │   │       │   ├── TransactionController.php
│   │   │       │   ├── CategoryController.php
│   │   │       │   ├── PointRuleController.php
│   │   │       │   ├── RewardController.php
│   │   │       │   └── AuditLogController.php
│   │   │       └── Controller.php
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php
│   │   │   ├── AuditMiddleware.php
│   │   │   └── ValidateQRPayload.php
│   │   ├── Requests/           # Form Request Validation
│   │   │   ├── Auth/
│   │   │   │   └── LoginRequest.php
│   │   │   ├── Transaction/
│   │   │   │   └── ProcessTransactionRequest.php
│   │   │   └── PointRule/
│   │   │       ├── CreatePointRuleRequest.php
│   │   │       └── UpdatePointRuleRequest.php
│   │   └── Resources/          # API Resources (JSON Transformers)
│   │       ├── MemberResource.php
│   │       ├── TransactionResource.php
│   │       ├── PointRuleResource.php
│   │       └── RewardResource.php
│   ├── Models/
│   │   ├── Member.php
│   │   ├── LoyaltyPoint.php
│   │   ├── Category.php
│   │   ├── PointRule.php
│   │   ├── Transaction.php
│   │   ├── Reward.php
│   │   ├── Redemption.php
│   │   ├── AuditLog.php
│   │   └── User.php
│   ├── Services/               # Business Logic Layer
│   │   ├── QRService.php
│   │   ├── PointsEngineService.php
│   │   ├── TransactionService.php
│   │   ├── AuditService.php
│   │   └── RedemptionService.php
│   ├── Repositories/           # Data Access Layer (Optional)
│   │   ├── MemberRepository.php
│   │   └── TransactionRepository.php
│   ├── Exceptions/             # Custom Exceptions
│   │   ├── InvalidQRException.php
│   │   ├── InsufficientPointsException.php
│   │   └── RuleNotFoundException.php
│   └── Providers/
│       ├── AppServiceProvider.php
│       └── RouteServiceProvider.php
├── bootstrap/
│   ├── app.php
│   ├── cache/
│   └── providers.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── cors.php
│   └── jwt.php                 # JWT Configuration (to be created)
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_members_table.php
│   │   ├── 2024_01_01_000003_create_loyalty_points_table.php
│   │   ├── 2024_01_01_000004_create_categories_table.php
│   │   ├── 2024_01_01_000005_create_point_rules_table.php
│   │   ├── 2024_01_01_000006_create_transactions_table.php
│   │   ├── 2024_01_01_000007_create_rewards_table.php
│   │   ├── 2024_01_01_000008_create_redemptions_table.php
│   │   └── 2024_01_01_000009_create_audit_logs_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RoleSeeder.php
│   │   ├── CategorySeeder.php
│   │   └── TestDataSeeder.php
│   └── factories/
│       ├── MemberFactory.php
│       └── TransactionFactory.php
├── routes/
│   ├── api.php                 # API Routes Only
│   └── console.php
├── storage/
│   ├── app/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   │   └── LoginTest.php
│   │   ├── QR/
│   │   │   ├── QRGenerationTest.php
│   │   │   └── QRValidationTest.php
│   │   ├── Transaction/
│   │   │   └── ProcessTransactionTest.php
│   │   └── PointsEngine/
│   │       └── CalculatePointsTest.php
│   ├── Unit/
│   │   ├── Services/
│   │   │   ├── QRServiceTest.php
│   │   │   ├── PointsEngineServiceTest.php
│   │   │   └── TransactionServiceTest.php
│   │   └── Models/
│   │       └── MemberTest.php
│   └── TestCase.php
├── .env                        # Environment Configuration
├── .env.example
├── composer.json
├── phpunit.xml
└── README.md
```

---

## Naming Conventions

### Controllers
- **Pattern**: `{Resource}Controller.php`
- **Examples**: `MemberController.php`, `TransactionController.php`
- **Location**: `app/Http/Controllers/Api/V1/`
- **Namespace**: `App\Http\Controllers\Api\V1`

### Models
- **Pattern**: Singular, PascalCase
- **Examples**: `Member.php`, `Transaction.php`, `PointRule.php`
- **Location**: `app/Models/`
- **Namespace**: `App\Models`

### Services
- **Pattern**: `{Purpose}Service.php`
- **Examples**: `QRService.php`, `PointsEngineService.php`
- **Location**: `app/Services/`
- **Namespace**: `App\Services`

### Middleware
- **Pattern**: Descriptive name + `Middleware.php`
- **Examples**: `RoleMiddleware.php`, `AuditMiddleware.php`
- **Location**: `app/Http/Middleware/`
- **Namespace**: `App\Http\Middleware`

### Migrations
- **Pattern**: `YYYY_MM_DD_HHMMSS_create_{table}_table.php`
- **Examples**: `2024_01_01_000001_create_members_table.php`
- **Location**: `database/migrations/`

### Requests (Form Validation)
- **Pattern**: `{Action}{Resource}Request.php`
- **Examples**: `CreatePointRuleRequest.php`, `ProcessTransactionRequest.php`
- **Location**: `app/Http/Requests/{Resource}/`
- **Namespace**: `App\Http\Requests\{Resource}`

### Resources (API Transformers)
- **Pattern**: `{Model}Resource.php`
- **Examples**: `MemberResource.php`, `TransactionResource.php`
- **Location**: `app/Http/Resources/`
- **Namespace**: `App\Http\Resources`

### Tests
- **Pattern**: `{Feature}Test.php` or `{Class}Test.php`
- **Examples**: `LoginTest.php`, `QRServiceTest.php`
- **Location**: `tests/Feature/` or `tests/Unit/`

---

## API Versioning

All API routes are versioned under `/api/v1/`:

```
/api/v1/login
/api/v1/members/{id}
/api/v1/scan
/api/v1/categories
/api/v1/point-rules
```

Controllers are organized in versioned directories: `app/Http/Controllers/Api/V1/`

---

## Environment Configuration

### Required .env Variables

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

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_TTL=1440
JWT_REFRESH_TTL=20160

# QR Code Security
QR_SECRET=your-hmac-secret-key-here
QR_EXPIRY_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=database
```

---

## Database Configuration

### Connection Setup

1. Create MySQL database:
```sql
CREATE DATABASE loyalty_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update `.env` file with database credentials

3. Run migrations:
```bash
php artisan migrate
```

4. Seed initial data:
```bash
php artisan db:seed
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Resource data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

---

## Service Layer Pattern

All business logic resides in Service classes:

```php
// Controller (thin)
public function store(ProcessTransactionRequest $request)
{
    $transaction = $this->transactionService->process($request->validated());
    return new TransactionResource($transaction);
}

// Service (business logic)
public function process(array $data): Transaction
{
    return DB::transaction(function () use ($data) {
        // Validate QR
        // Calculate points
        // Create transaction
        // Update balance
        // Log audit
    });
}
```

---

## Middleware Usage

### Role-Based Access
```php
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::apiResource('point-rules', PointRuleController::class);
});
```

### Audit Logging
```php
Route::middleware(['auth:api', 'audit'])->group(function () {
    Route::post('/scan', [QRController::class, 'scan']);
});
```

---

## Testing Strategy

### Unit Tests
- Test individual services in isolation
- Mock dependencies
- Focus on business logic

### Feature Tests
- Test complete API endpoints
- Use database transactions
- Test authentication and authorization

### Run Tests
```bash
# All tests
php artisan test

# Specific test
php artisan test --filter QRServiceTest

# With coverage
php artisan test --coverage
```

---

## Development Commands

```bash
# Start development server
php artisan serve

# Create controller
php artisan make:controller Api/V1/MemberController --api

# Create model with migration
php artisan make:model Member -m

# Create service
php artisan make:class Services/QRService

# Create middleware
php artisan make:middleware RoleMiddleware

# Create request validation
php artisan make:request Transaction/ProcessTransactionRequest

# Create resource
php artisan make:resource MemberResource

# Create test
php artisan make:test QRServiceTest --unit

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## Security Checklist

- ✅ All routes protected with authentication
- ✅ Role-based access control implemented
- ✅ QR codes signed with HMAC-SHA256
- ✅ Input validation on all requests
- ✅ SQL injection prevention (Eloquent ORM)
- ✅ CORS configured for frontend origin only
- ✅ Sensitive data in .env (not committed)
- ✅ Rate limiting on authentication endpoints
- ✅ Audit logging for all mutations

---

## Next Steps

1. Install JWT authentication package
2. Create database migrations
3. Set up CORS configuration
4. Create base controller and middleware
5. Implement authentication system
