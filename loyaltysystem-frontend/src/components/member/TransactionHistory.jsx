import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const TransactionHistory = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });

    const fetchTransactions = async (page = 1) => {
        if (!user?.member?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/members/${user.member.id}/transactions?page=${page}`);
            const payload = response.data?.data || {};
            const rows = Array.isArray(payload.data) ? payload.data : [];

            setTransactions(rows);
            setPagination({
                current: payload.current_page || page,
                pageSize: payload.per_page || pagination.pageSize,
                total: payload.total || rows.length,
            });
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'date',
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Reference',
            dataIndex: 'reference_no',
            key: 'ref',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `₱${parseFloat(amount).toFixed(2)}`,
            align: 'right',
        },
        {
            title: 'Points',
            dataIndex: 'points_earned',
            key: 'points',
            render: (points) => (
                <span style={{ color: points > 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                    {points > 0 ? '+' : ''}{parseFloat(points).toFixed(2)}
                </span>
            ),
            align: 'right',
        },
    ];

    return (
        <Card title="Activity History">
            <Table
                dataSource={transactions}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchTransactions(page)
                }}
            />
        </Card>
    );
};

export default TransactionHistory;
