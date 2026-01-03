import { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    QrcodeOutlined,
    HistoryOutlined,
    GiftOutlined,
    SettingOutlined,
    SafetyCertificateOutlined,
    BarChartOutlined,
    TeamOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, ROLES } from '../../utils/constants';

const { Header, Content, Footer, Sider } = Layout;

const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: handleLogout,
            },
        ],
    };

    // Define menus based on roles
    const getMenuItems = () => {
        const role = user?.role;
        const items = [];

        // Common Dashboard
        // items.push({
        //     key: `/${role}/dashboard`, // e.g., /member/dashboard
        //     icon: <DashboardOutlined />,
        //     label: 'Dashboard',
        // });

        if (role === ROLES.MEMBER) {
            items.push(
                { key: '/member/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/member/transactions', icon: <HistoryOutlined />, label: 'Transactions' },
                { key: '/member/rewards', icon: <GiftOutlined />, label: 'Rewards' },
                { key: '/member/qr-code', icon: <QrcodeOutlined />, label: 'My QR Code' }
            );
        }

        if (role === ROLES.STAFF) {
            items.push(
                { key: '/staff/scan', icon: <QrcodeOutlined />, label: 'Scan QR' },
                { key: '/staff/member-lookup', icon: <UserOutlined />, label: 'Member Lookup' }
            );
        }

        if (role === ROLES.ADMIN) {
            items.push(
                { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
                { key: '/admin/categories', icon: <SettingOutlined />, label: 'Categories' },
                { key: '/admin/rules', icon: <SafetyCertificateOutlined />, label: 'Point Rules' },
                { key: '/admin/rewards', icon: <GiftOutlined />, label: 'Rewards' },
                { key: '/admin/redemptions', icon: <GiftOutlined />, label: 'Redemptions' },
                { key: '/admin/branches', icon: <SettingOutlined />, label: 'Branches' },
                { key: '/admin/members', icon: <IdcardOutlined />, label: 'Members' },
                { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
                { key: '/admin/audit-logs', icon: <HistoryOutlined />, label: 'Audit Logs' }
            );
        }

        return items;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
                    {collapsed ? 'LS' : APP_NAME}
                </div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={[location.pathname]}
                    mode="inline"
                    items={getMenuItems()}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <Space>
                        <span style={{ marginRight: 8 }}>Welcome, {user?.name} ({user?.role})</span>
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#1890ff' }} />
                        </Dropdown>
                    </Space>
                </Header>
                <Content style={{ margin: '16px 16px', background: '#fff', padding: 24, minHeight: 280, borderRadius: 8 }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    {APP_NAME} ©{new Date().getFullYear()} Created by Barbaza Multi-Purpose Cooperative 
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
