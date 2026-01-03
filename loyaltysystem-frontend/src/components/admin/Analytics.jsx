import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { UserOutlined, ShopOutlined, TransactionOutlined, DollarCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>;
    if (!data) return null;

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>Dashboard Analytics</Title>

            {/* 1. Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Members"
                            value={data.summary.total_members}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Staff"
                            value={data.summary.active_staff}
                            prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Transactions"
                            value={data.summary.total_transactions}
                            prefix={<TransactionOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Points Issued"
                            value={data.summary.points_issued}
                            precision={2}
                            prefix={<DollarCircleOutlined style={{ color: '#eb2f96' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 2. Charts Row */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                {/* Bar Chart: Transaction Trends */}
                <Col xs={24} lg={16}>
                    <Card title="Transaction Trends (Last 7 Days)" bordered={false} className="shadow-sm">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" name="Count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="amount" name="Volume (PHP)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Pie Chart: Category Distribution */}
                <Col xs={24} lg={8}>
                    <Card title="Transactions by Category" bordered={false} className="shadow-sm">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 3. Recent Activity Table */}
            <Row>
                <Col span={24}>
                    <Card title="Recent Transactions" bordered={false} className="shadow-sm">
                        <Table
                            dataSource={data.recent_activity}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: 'Member', dataIndex: 'member', key: 'member' },
                                { title: 'Action', dataIndex: 'action', key: 'action' },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val) => `₱${val}` },
                                { title: 'Points', dataIndex: 'points', key: 'points', render: (val) => `+${val} pts` },
                                { title: 'Time', dataIndex: 'time', key: 'time', render: (text) => <span style={{ color: '#888' }}>{text}</span> },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Analytics;
