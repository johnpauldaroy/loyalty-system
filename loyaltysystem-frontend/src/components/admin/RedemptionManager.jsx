import { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Space, message, Typography, Badge, Tabs } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, GiftOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RedemptionManager = () => {
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [activeTab, setActiveTab] = useState('pending');

    const fetchRedemptions = async (page = 1, status = activeTab) => {
        setLoading(true);
        try {
            const response = await api.get(`/redemptions?page=${page}&status=${status}`);
            const payload = response.data?.data || {};
            setRedemptions(payload.data || []);
            setPagination({
                current: payload.current_page || page,
                pageSize: payload.per_page || 15,
                total: payload.total || 0,
            });
        } catch (error) {
            message.error('Failed to load redemptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRedemptions(1, activeTab);
    }, [activeTab]);

    const handleComplete = async (id) => {
        try {
            await api.patch(`/redemptions/${id}`);
            message.success('Redemption marked as claimed');
            fetchRedemptions(pagination.current, activeTab);
        } catch (error) {
            message.error('Failed to update redemption');
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'date',
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Member',
            dataIndex: 'member',
            key: 'member',
            render: (member) => member ? (
                <div>
                    <Text strong>{member.name}</Text><br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{member.member_code}</Text>
                </div>
            ) : 'Unknown',
        },
        {
            title: 'Reward',
            dataIndex: 'reward',
            key: 'reward',
            render: (reward) => (
                <Space>
                    <GiftOutlined style={{ color: '#faad14' }} />
                    {reward?.name || 'Unknown'}
                </Space>
            ),
        },
        {
            title: 'Points Used',
            dataIndex: 'points_used',
            key: 'points',
            align: 'right',
            render: (pts) => <Text strong color="gold">{parseFloat(pts).toFixed(0)} PTS</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'orange'} icon={status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                record.status === 'pending' && (
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleComplete(record.id)}
                    >
                        Mark as Claimed
                    </Button>
                )
            ),
        },
    ];

    const tabItems = [
        { key: 'pending', label: <Badge count={activeTab === 'pending' ? pagination.total : 0} offset={[10, 0]}>Pending Claims</Badge> },
        { key: 'completed', label: 'Completed' },
    ];

    return (
        <Card title={<Space><GiftOutlined /> <Title level={4} style={{ margin: 0 }}>Redemption Management</Title></Space>}>
            <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
            <Table
                columns={columns}
                dataSource={redemptions}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchRedemptions(page, activeTab)
                }}
            />
        </Card>
    );
};

export default RedemptionManager;
