import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin, Avatar, Typography } from 'antd';
import { UserOutlined, ShopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Title, Text } = Typography;

const Dashboard = () => {
    const { user } = useAuth();
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!user?.member?.id) {
                setLoading(false);
                return;
            }
            try {
                console.log("Fetching member data for ID:", user.member.id);
                const response = await api.get(`/members/${user.member.id}`);
                console.log("Member data received:", response.data.data);
                setMemberData(response.data.data);
            } catch (error) {
                console.error("Failed to fetch member data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [user]);

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    if (!memberData) return <div style={{ textAlign: 'center', marginTop: 50 }}>No Member Profile Linked</div>;

    return (
        <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginBottom: 10 }} />
                <Title level={2} style={{ margin: 0 }}>Hello, {memberData.name}!</Title>
                <Text type="secondary">
                    {memberData.member_code} • {memberData.branch?.name || memberData.branch || 'No Branch'}
                </Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable>
                        <Statistic
                            title="Current Loyalty Points"
                            value={memberData.loyalty_point?.balance ?? memberData.balance ?? 0}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable>
                        <Statistic
                            title="Membership Status"
                            value={memberData.status.toUpperCase()}
                            valueStyle={{ color: memberData.status === 'active' ? '#1890ff' : '#cf1322' }}
                            prefix={<SafetyCertificateOutlined />}
                        />
                    </Card>
                </Col>
                {/* Add more widgets as needed */}
            </Row>
        </div>
    );
};

export default Dashboard;
