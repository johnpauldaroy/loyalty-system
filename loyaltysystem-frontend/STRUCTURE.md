# React Frontend - Project Structure

## Overview
React + Vite + Ant Design frontend for QR-based Loyalty Points System with three role-based interfaces.

---

## Directory Structure

```
loyaltysystem-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx          # Main layout wrapper
│   │   │   ├── Header.jsx             # Top navigation bar
│   │   │   ├── Sidebar.jsx            # Side navigation menu
│   │   │   └── Footer.jsx             # Footer component
│   │   ├── member/                    # Member-specific components
│   │   │   ├── Dashboard.jsx          # Points balance dashboard
│   │   │   ├── TransactionHistory.jsx # Transaction list
│   │   │   ├── RewardsCatalog.jsx     # Available rewards
│   │   │   ├── MyQRCode.jsx           # QR code display
│   │   │   └── ProfileCard.jsx        # Member profile info
│   │   ├── staff/                     # Staff-specific components
│   │   │   ├── QRScanner.jsx          # QR scanning interface
│   │   │   ├── TransactionForm.jsx    # Transaction creation form
│   │   │   ├── CategorySelector.jsx   # Category dropdown
│   │   │   ├── MemberSummary.jsx      # Member info display
│   │   │   └── ConfirmationModal.jsx  # Transaction confirmation
│   │   ├── admin/                     # Admin-specific components
│   │   │   ├── CategoryManager.jsx    # Category CRUD
│   │   │   ├── PointRuleBuilder.jsx   # Rule creation form
│   │   │   ├── PointRuleList.jsx      # Rules table
│   │   │   ├── RewardsManager.jsx     # Rewards CRUD
│   │   │   ├── Analytics.jsx          # Dashboard analytics
│   │   │   ├── AuditLogViewer.jsx     # Audit log table
│   │   │   └── UserManagement.jsx     # User CRUD
│   │   └── common/                    # Shared components
│   │       ├── ProtectedRoute.jsx     # Route guard
│   │       ├── PointsDisplay.jsx      # Points formatter
│   │       ├── LoadingSpinner.jsx     # Loading state
│   │       └── ErrorBoundary.jsx      # Error handling
│   ├── context/
│   │   ├── AuthContext.jsx            # Authentication state
│   │   └── ThemeContext.jsx           # Theme configuration
│   ├── pages/
│   │   ├── Login.jsx                  # Login page
│   │   ├── NotFound.jsx               # 404 page
│   │   ├── Unauthorized.jsx           # 403 page
│   │   ├── member/
│   │   │   ├── MemberDashboard.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── RewardsPage.jsx
│   │   │   └── QRCodePage.jsx
│   │   ├── staff/
│   │   │   └── ScannerPage.jsx
│   │   └── admin/
│   │       ├── CategoriesPage.jsx
│   │       ├── RulesPage.jsx
│   │       ├── RewardsPage.jsx
│   │       ├── AnalyticsPage.jsx
│   │       └── AuditLogsPage.jsx
│   ├── services/
│   │   ├── api.js                     # Axios instance
│   │   ├── authService.js             # Auth API calls
│   │   ├── memberService.js           # Member API calls
│   │   ├── qrService.js               # QR API calls
│   │   ├── transactionService.js      # Transaction API calls
│   │   ├── categoryService.js         # Category API calls
│   │   ├── pointRuleService.js        # Point rule API calls
│   │   └── rewardService.js           # Reward API calls
│   ├── utils/
│   │   ├── constants.js               # App constants
│   │   ├── formatters.js              # Data formatters
│   │   ├── validators.js              # Form validators
│   │   └── helpers.js                 # Helper functions
│   ├── styles/
│   │   ├── variables.css              # CSS variables
│   │   └── global.css                 # Global styles
│   ├── App.jsx                        # Root component
│   ├── App.css                        # App styles
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Base styles
├── .env                               # Environment variables
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Naming Conventions

### Components
- **Pattern**: PascalCase, descriptive names
- **Examples**: `QRScanner.jsx`, `TransactionHistory.jsx`, `PointRuleBuilder.jsx`
- **Location**: `src/components/{category}/`

### Pages
- **Pattern**: PascalCase + `Page` suffix
- **Examples**: `MemberDashboard.jsx`, `ScannerPage.jsx`, `RulesPage.jsx`
- **Location**: `src/pages/{role}/`

### Services
- **Pattern**: camelCase + `Service` suffix
- **Examples**: `authService.js`, `qrService.js`, `transactionService.js`
- **Location**: `src/services/`

### Context
- **Pattern**: PascalCase + `Context` suffix
- **Examples**: `AuthContext.jsx`, `ThemeContext.jsx`
- **Location**: `src/context/`

### Utilities
- **Pattern**: camelCase, plural for collections
- **Examples**: `constants.js`, `formatters.js`, `validators.js`
- **Location**: `src/utils/`

---

## Component Organization

### By Role

Components are organized by user role for clarity:

- **`layout/`** - Shared layout components
- **`member/`** - Member-only components
- **`staff/`** - Staff-only components
- **`admin/`** - Admin-only components
- **`common/`** - Reusable across all roles

---

## Routing Structure

```jsx
/                           → Redirect to role-specific dashboard
/login                      → Login page

/member/dashboard           → Member dashboard
/member/transactions        → Transaction history
/member/rewards             → Rewards catalog
/member/qr-code             → My QR code

/staff/scan                 → QR scanner

/admin/categories           → Category management
/admin/rules                → Point rules management
/admin/rewards              → Rewards management
/admin/analytics            → Analytics dashboard
/admin/audit-logs           → Audit log viewer
```

---

## State Management

### Authentication State (AuthContext)

```jsx
{
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "member" | "staff" | "admin"
  },
  token: "jwt-token",
  isAuthenticated: true,
  loading: false
}
```

### Methods
- `login(credentials)` - Authenticate user
- `logout()` - Clear session
- `refreshToken()` - Refresh JWT

---

## API Service Pattern

All API calls go through service files:

```javascript
// services/memberService.js
import api from './api';

export const getMemberDetails = async (memberId) => {
  const response = await api.get(`/members/${memberId}`);
  return response.data;
};

export const getMemberPoints = async (memberId) => {
  const response = await api.get(`/members/${memberId}/points`);
  return response.data;
};
```

---

## Ant Design Configuration

### Theme Customization

```jsx
// main.jsx
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
};

<ConfigProvider theme={theme}>
  <App />
</ConfigProvider>
```

### Common Components Used
- `Layout`, `Menu`, `Breadcrumb` - Layout
- `Form`, `Input`, `Select`, `Button` - Forms
- `Table`, `Card`, `Descriptions` - Data display
- `Modal`, `message`, `notification` - Feedback
- `Spin` - Loading states

---

## Environment Variables

### .env File

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000

# Application
VITE_APP_NAME=Loyalty System
VITE_APP_VERSION=1.0.0

# QR Scanner
VITE_QR_SCAN_FPS=10
VITE_QR_SCAN_QBOX=250
```

### Usage

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Protected Routes

```jsx
// components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

---

## Form Validation

Using Ant Design Form with custom validators:

```jsx
<Form.Item
  name="amount"
  label="Amount"
  rules={[
    { required: true, message: 'Please enter amount' },
    { type: 'number', min: 0, message: 'Amount must be positive' }
  ]}
>
  <InputNumber prefix="₱" style={{ width: '100%' }} />
</Form.Item>
```

---

## QR Code Integration

### Scanning (html5-qrcode)

```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';

useEffect(() => {
  const scanner = new Html5QrcodeScanner('qr-reader', {
    fps: 10,
    qrbox: 250
  });
  
  scanner.render(onScanSuccess, onScanError);
  
  return () => scanner.clear();
}, []);
```

### Display (qrcode.react)

```jsx
import QRCode from 'qrcode.react';

<QRCode
  value={JSON.stringify(qrPayload)}
  size={256}
  level="H"
  includeMargin={true}
/>
```

---

## Error Handling

### Global Error Boundary

```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```javascript
// services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Styling Approach

### CSS Modules (Optional)
```jsx
import styles from './Component.module.css';

<div className={styles.container}>...</div>
```

### Inline Styles with Ant Design
```jsx
<Card style={{ marginBottom: 16 }}>...</Card>
```

### Global CSS Variables
```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --error-color: #ff4d4f;
}
```

---

## Testing Strategy

### Component Tests
```bash
npm test
```

### E2E Tests (Optional)
- Use Playwright or Cypress
- Test critical user flows (login, scan, transaction)

---

## Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Memoization with React.memo()
- ✅ Debounced search inputs
- ✅ Virtualized long lists (Ant Design Table pagination)
- ✅ Image optimization
- ✅ Bundle size monitoring

---

## Security Checklist

- ✅ JWT stored in httpOnly cookies (or localStorage with caution)
- ✅ CSRF protection
- ✅ Input sanitization
- ✅ XSS prevention
- ✅ Secure QR payload validation
- ✅ Role-based route protection
- ✅ API request authentication headers

---

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast compliance (WCAG AA)

---

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## Next Steps

1. Configure environment variables
2. Set up routing with React Router
3. Create authentication context
4. Build layout components
5. Implement API service layer
