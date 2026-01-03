import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const PointRuleBuilder = () => {
    const [rules, setRules] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rulesRes, catsRes] = await Promise.all([
                api.get('/point-rules'),
                api.get('/categories')
            ]);
            setRules(rulesRes.data.data);
            setCategories(catsRes.data.data);
        } catch (error) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingRule(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRule(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/point-rules/${id}`);
            message.success('Rule deleted');
            fetchData();
        } catch (error) {
            message.error('Delete failed');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingRule) {
                await api.put(`/point-rules/${editingRule.id}`, values);
                message.success('Rule updated');
            } else {
                await api.post('/point-rules', values);
                message.success('Rule created');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
            message.error('Operation failed');
        }
    };

    const columns = [
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category'
        },
        { title: 'Action', dataIndex: 'action', key: 'action' },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'fixed' ? 'blue' : 'purple'}>{type.toUpperCase()}</Tag>
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value'
        },
        {
            title: 'Conditions',
            key: 'conditions',
            render: (_, record) => (
                <small>
                    {record.min_amount > 0 && <div>Min: {record.min_amount}</div>}
                    {record.max_points > 0 && <div>Max: {record.max_points}</div>}
                </small>
            )
        },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
            render: (active) => <Switch checked={active} disabled />
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete rule?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Point Rules Configuration</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Rule</Button>
            </div>
            <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} />

            <Modal
                title={editingRule ? 'Edit Rule' : 'New Rule'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                        <Select placeholder="Select Category">
                            {categories.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="action" label="Action" rules={[{ required: true }]} initialValue="PURCHASE">
                        <Input placeholder="e.g. PURCHASE, PAYMENT" />
                    </Form.Item>

                    <Form.Item name="type" label="Calculation Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="fixed">Fixed Points (Flat)</Option>
                            <Option value="multiplier">Multiplier (Points per Unit)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="value" label="Value" rules={[{ required: true }]} help="Multiplier: Divisor Amount (e.g., 20 = 1 pt per 20). Fixed: Actual Points.">
                        <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="min_amount" label="Minimum Transaction Amount">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="max_points" label="Maximum Points Limit">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="active" label="Active" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PointRuleBuilder;
