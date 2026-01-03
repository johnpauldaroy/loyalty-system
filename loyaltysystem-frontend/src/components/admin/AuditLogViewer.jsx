import { useState, useEffect } from 'react';
import { Table, Card, Form, Select, DatePicker, Button, Tag, Space, message, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState({});
    const [form] = Form.useForm();

    const fetchLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            let query = `?page=${page}`;
            if (currentFilters.action) query += `&action=${currentFilters.action}`;
            if (currentFilters.user_id) query += `&user_id=${currentFilters.user_id}`;
            if (currentFilters.dateRange && currentFilters.dateRange[0]) {
                query += `&start_date=${currentFilters.dateRange[0].format('YYYY-MM-DD')}`;
                query += `&end_date=${currentFilters.dateRange[1].format('YYYY-MM-DD')}`;
            }

            const response = await api.get(`/audit-logs${query}`);
            const result = response.data.data;

            setLogs(result.data);
            setPagination({
                current: result.current_page,
                pageSize: result.per_page,
                total: result.total,
            });
        } catch (error) {
            message.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = (values) => {
        setFilters(values);
        fetchLogs(1, values);
    };

    const handleReset = () => {
        form.resetFields();
        setFilters({});
        fetchLogs(1, {});
    };

    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 150,
            render: (user) => user ? `${user.name} (${user.role})` : 'System',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => {
                let color = 'blue';
                if (text.includes('DELETE')) color = 'red';
                if (text.includes('CREATE')) color = 'green';
                if (text.includes('UPDATE')) color = 'orange';
                if (text.includes('FRAUD')) color = 'purple';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Target ID',
            dataIndex: 'model_id',
            key: 'model_id',
            width: 100,
            render: (text, record) => text ? `${record.model_type?.split('\\').pop() || ''} #${text}` : '-',
        },
        {
            title: 'Details (Payload)',
            dataIndex: 'payload',
            key: 'payload',
            render: (payload) => (
                <div style={{ maxHeight: 60, overflowY: 'auto', fontSize: 12, fontFamily: 'monospace' }}>
                    {JSON.stringify(payload)}
                </div>
            ),
        }
    ];

    return (
        <Card title="System Audit Logs">
            <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 20 }}>
                <Form.Item name="action">
                    <Select placeholder="Filter by Action" style={{ width: 180 }} allowClear>
                        <Option value="CATEGORY_CREATED">Category Created</Option>
                        <Option value="CATEGORY_UPDATED">Category Updated</Option>
                        <Option value="CATEGORY_DELETED">Category Deleted</Option>
                        <Option value="RULE_CREATED">Rule Created</Option>
                        <Option value="RULE_UPDATED">Rule Updated</Option>
                        <Option value="TRANSACTION_CREATED">Transaction Created</Option>
                        <Option value="FRAUD_EVALUATION">Fraud Evaluation</Option>
                        <Option value="FRAUD_BLOCK">Fraud Block</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="user_id">
                    <Input placeholder="User ID" style={{ width: 100 }} />
                </Form.Item>
                <Form.Item name="dateRange">
                    <RangePicker />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Filter</Button>
                        <Button onClick={handleReset} icon={<ReloadOutlined />}>Reset</Button>
                    </Space>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchLogs(page, filters)
                }}
            />
        </Card>
    );
};

export default AuditLogViewer;
