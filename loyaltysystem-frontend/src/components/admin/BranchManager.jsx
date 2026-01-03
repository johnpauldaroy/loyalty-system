import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [form] = Form.useForm();

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/branches');
            setBranches(response.data.data || []);
        } catch (error) {
            message.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleAdd = () => {
        setEditingBranch(null);
        form.resetFields();
        form.setFieldsValue({ status: 'active' });
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingBranch(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/branches/${id}`);
            message.success('Branch deleted');
            fetchBranches();
        } catch (error) {
            message.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingBranch) {
                await api.put(`/branches/${editingBranch.id}`, values);
                message.success('Branch updated');
            } else {
                await api.post('/branches', values);
                message.success('Branch created');
            }
            setIsModalVisible(false);
            fetchBranches();
        } catch (error) {
            if (error?.errorFields) return;
            const msg = error.response?.data?.message || 'Operation failed';
            message.error(msg);
        }
    };

    const columns = [
        { title: 'Code', dataIndex: 'code', key: 'code' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'active' ? 'green' : 'orange';
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete branch?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Branches</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Branch</Button>
            </div>
            <Table columns={columns} dataSource={branches} rowKey="id" loading={loading} />

            <Modal
                title={editingBranch ? 'Edit Branch' : 'New Branch'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Branch Code" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="Branch Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BranchManager;
