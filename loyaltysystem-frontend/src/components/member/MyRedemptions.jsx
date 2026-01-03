import { useEffect, useState } from 'react';
import { List, Card, Tag, Typography, Space, Empty, Spin } from 'antd';
import { GiftOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const MyRedemptions = () => {
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyRedemptions = async () => {
            try {
                const response = await api.get('/redemptions');
                setRedemptions(response.data?.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch redemptions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRedemptions();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div>
            <Title level={3}><GiftOutlined /> My Redemptions</Title>
            <Paragraph type="secondary">
                View your reward claims. Present your ID or QR code at the branch to claim pending items.
            </Paragraph>

            <List
                dataSource={redemptions}
                renderItem={(item) => (
                    <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: 16 }}>{item.reward?.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Redeemed on {dayjs(item.created_at).format('MMMM D, YYYY HH:mm')}
                                </Text>
                            </Space>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Tag color="gold" style={{ borderRadius: 12 }}>{parseFloat(item.points_used).toFixed(0)} PTS</Tag>
                                </div>
                                <Tag
                                    color={item.status === 'completed' ? 'green' : 'orange'}
                                    icon={item.status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                    style={{ borderRadius: 4 }}
                                >
                                    {item.status?.toUpperCase()}
                                </Tag>
                            </div>
                        </div>
                    </Card>
                )}
                locale={{ emptyText: <Empty description="You haven't redeemed any rewards yet." /> }}
            />
        </div>
    );
};

export default MyRedemptions;
