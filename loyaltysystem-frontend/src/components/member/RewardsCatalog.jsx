import { useEffect, useState } from 'react';
import { Card, List, Button, Typography, Tag, Modal, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Meta } = Card;
const { Text } = Typography;

const RewardsCatalog = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await api.get('/rewards');
                setRewards(response.data.data);
            } catch (error) {
                message.error('Failed to load rewards');
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, []);

    const handleRedeem = (reward) => {
        Modal.confirm({
            title: 'Confirm Redemption',
            content: `Are you sure you want to redeem "${reward.name}" for ${parseFloat(reward.points_required)} points?`,
            okText: 'Redeem Now',
            onOk: async () => {
                const hide = message.loading('Processing redemption...', 0);
                try {
                    await api.post('/redemptions', { reward_id: reward.id });
                    hide();
                    message.success('Redemption successful!');
                    fetchRewards(); // Refresh stock
                    // Optionally trigger a user profile refresh to update balance in dashboard if in context
                } catch (error) {
                    hide();
                    const msg = error.response?.data?.message || 'Redemption failed';
                    message.error(msg);
                }
            }
        });
    };

    return (
        <div>
            <Typography.Title level={3}><GiftOutlined /> Rewards Catalog</Typography.Title>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
                dataSource={rewards}
                loading={loading}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            hoverable
                            actions={[
                                <Button type="primary" onClick={() => handleRedeem(item)} disabled={item.stock <= 0}>
                                    {item.stock > 0 ? 'Redeem' : 'Out of Stock'}
                                </Button>
                            ]}
                        >
                            <Meta
                                title={item.name}
                                description={
                                    <div>
                                        <div style={{ height: 40, overflow: 'hidden', marginBottom: 10 }}>{item.description || 'No description available'}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Tag color="gold" style={{ fontSize: 14, padding: '4px 8px' }}>
                                                {parseFloat(item.points_required)} PTS
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Stock: {item.stock}</Text>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default RewardsCatalog;
