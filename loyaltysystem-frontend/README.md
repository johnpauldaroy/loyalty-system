# Loyalty System Frontend

React + Vite + Ant Design frontend for QR-based Loyalty Points System.

## Features

- 🎨 Modern UI with Ant Design
- 🔐 Role-based access control (Member, Staff, Admin)
- 📱 QR code scanning and generation
- 📊 Real-time points tracking
- 🎯 Dynamic rewards catalog
- 📈 Analytics dashboard (Admin)
- 🔍 Audit log viewer (Admin)

---

## Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. **Start Development Server**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Project Structure

See [STRUCTURE.md](STRUCTURE.md) for detailed folder organization and naming conventions.

---

## User Roles

### Member
- View points balance
- View transaction history
- Browse rewards catalog
- Display QR code for scanning

### Staff / Teller
- Scan member QR codes
- Create transactions
- View member summary

### Admin
- Manage categories
- Define point rules
- Manage rewards
- View analytics
- View audit logs
- Manage users

---

## Key Dependencies

- **React 19** - UI library
- **Vite 7** - Build tool
- **Ant Design 5** - UI component library
- **React Router 7** - Routing
- **Axios** - HTTP client
- **html5-qrcode** - QR code scanner
- **qrcode.react** - QR code generator
- **dayjs** - Date formatting

---

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## Environment Variables

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

---

## Routing

```
/                           → Redirect to role dashboard
/login                      → Login page

/member/dashboard           → Member dashboard
/member/transactions        → Transaction history
/member/rewards             → Rewards catalog
/member/qr-code             → My QR code

/staff/scan                 → QR scanner

/admin/categories           → Category management
/admin/rules                → Point rules
/admin/rewards              → Rewards management
/admin/analytics            → Analytics
/admin/audit-logs           → Audit logs
```

---

## Development Guidelines

### Component Structure
```jsx
// components/member/Dashboard.jsx
import { Card, Statistic } from 'antd';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <Card title="My Points">
      <Statistic value={user.points} suffix="points" />
    </Card>
  );
};

export default Dashboard;
```

### API Service Pattern
```javascript
// services/memberService.js
import api from './api';

export const getMemberPoints = async (memberId) => {
  const response = await api.get(`/members/${memberId}/points`);
  return response.data;
};
```

### Protected Routes
```jsx
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

---

## Ant Design Theme

Customized theme in `main.jsx`:

```javascript
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
};
```

---

## QR Code Features

### Scanning
- Uses `html5-qrcode` library
- Real-time camera scanning
- Automatic payload validation

### Generation
- Uses `qrcode.react` library
- HMAC-signed payloads
- High error correction level

---

## Security

- ✅ JWT authentication
- ✅ Role-based route protection
- ✅ Secure QR payload handling
- ✅ Input validation
- ✅ XSS prevention
- ✅ CORS configuration

---

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## License

Proprietary - Financial Cooperative Internal Use Only
