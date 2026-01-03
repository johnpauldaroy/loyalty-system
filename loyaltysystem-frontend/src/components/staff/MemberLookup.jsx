import { useState } from 'react';
import { Card, Input, Table, Tag, message } from 'antd';
import api from '../../services/api';

const MemberLookup = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const handleSearch = async (value) => {
        const term = value.trim();
        if (!term) {
            message.error('Enter a member code, name, email, or phone');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/members/lookup', { params: { q: term } });
            setResults(response.data.data || []);
        } catch (error) {
            const msg = error.response?.data?.message || 'Lookup failed';
            message.error(msg);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Member Code', dataIndex: 'member_code', key: 'member_code' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Branch',
            dataIndex: ['branch', 'name'],
            key: 'branch'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value) => {
                const color = value === 'active' ? 'green' : value === 'suspended' ? 'red' : 'orange';
                return <Tag color={color}>{value}</Tag>;
            }
        },
        {
            title: 'Points',
            dataIndex: ['loyalty_point', 'balance'],
            key: 'points',
            render: (value) => {
                const numeric = Number.parseFloat(value ?? 0);
                return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
            }
        }
    ];

    return (
        <Card title="Member Lookup">
            <Input.Search
                placeholder="Search by member code, name, email, or phone"
                enterButton="Search"
                onSearch={handleSearch}
                loading={loading}
                allowClear
            />
            <Table
                style={{ marginTop: 16 }}
                columns={columns}
                dataSource={results}
                rowKey="id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'No members found' }}
            />
        </Card>
    );
};

export default MemberLookup;
