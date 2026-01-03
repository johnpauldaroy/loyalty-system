import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';

// Placeholders
import MemberDashboard from './components/member/Dashboard';
import TransactionHistory from './components/member/TransactionHistory';
import RewardsCatalog from './components/member/RewardsCatalog';
import MyQRCode from './components/member/MyQRCode';
import MyRedemptions from './components/member/MyRedemptions';

import QRScanner from './components/staff/QRScanner';
import MemberLookup from './components/staff/MemberLookup';

// Admin Components
import CategoryManager from './components/admin/CategoryManager';
import PointRuleBuilder from './components/admin/PointRuleBuilder';
import RewardsManager from './components/admin/RewardsManager';
import AuditLogViewer from './components/admin/AuditLogViewer';
import UserManager from './components/admin/UserManager';
import MemberManager from './components/admin/MemberManager';
import BranchManager from './components/admin/BranchManager';
import Analytics from './components/admin/Analytics';
import RedemptionManager from './components/admin/RedemptionManager';
import { ROLES } from './utils/constants';

import { ConfigProvider } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1', // Indigo Primary
          borderRadius: 8,
          fontFamily: "'Inter', system-ui, sans-serif",
          colorBgLayout: '#f8fafc', // Light Slate Background
        },
        components: {
          Button: { controlHeight: 40 },
          Card: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Member Routes */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.MEMBER]} />}>
                  <Route path="/member/dashboard" element={<MemberDashboard />} />
                  <Route path="/member/transactions" element={<TransactionHistory />} />
                  <Route path="/member/rewards" element={<RewardsCatalog />} />
                  <Route path="/member/redemptions" element={<MyRedemptions />} />
                  <Route path="/member/qr-code" element={<MyQRCode />} />
                </Route>

                {/* Staff Routes */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF]} />}>
                  <Route path="/staff/scan" element={<QRScanner />} />
                  <Route path="/staff/member-lookup" element={<MemberLookup />} />
                  <Route path="/staff/redemptions" element={<RedemptionManager />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/categories" element={<CategoryManager />} />
                  <Route path="/admin/rules" element={<PointRuleBuilder />} />
                  <Route path="/admin/rewards" element={<RewardsManager />} />
                  <Route path="/admin/redemptions" element={<RedemptionManager />} />
                  <Route path="/admin/branches" element={<BranchManager />} />
                  <Route path="/admin/audit-logs" element={<AuditLogViewer />} />
                  <Route path="/admin/users" element={<UserManager />} />
                  <Route path="/admin/members" element={<MemberManager />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
