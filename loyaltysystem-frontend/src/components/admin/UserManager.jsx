import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState('');
    const [form] = Form.useForm();

    const fetchUsers = async (term = search) => {
        setLoading(true);
        try {
            const params = term ? { search: term } : {};
            const response = await api.get('/users', { params });
            setUsers(response.data.data);
        } catch (error) {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('User deleted');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                // Remove password if empty to avoid overwriting 
                if (!values.password) {
                    delete values.password;
                }
                await api.put(`/users/${editingUser.id}`, values);
                message.success('User updated');
            } else {
                await api.post('/users', values);
                message.success('User created');
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Operation failed';
            message.error(msg);
        }
    };
    const handleSearch = (value) => {
        const term = value.trim();
        setSearch(term);
        fetchUsers(term);
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'default';
                if (role === 'admin') color = 'magenta';
                if (role === 'staff') color = 'blue';
                if (role === 'member') color = 'green';
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <h2>User Management</h2>
                <Space>
                    <Input.Search
                        placeholder="Search users"
                        allowClear
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 240 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add User</Button>
                </Space>
            </div>
            <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />

            <Modal
                title={editingUser ? 'Edit User' : 'New User'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={editingUser ? "Password (Leave blank to keep current)" : "Password"}
                        rules={[{ required: !editingUser, min: 8 }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select>
                            <Option value="admin">Admin</Option>
                            <Option value="staff">Staff</Option>
                            <Option value="member">Member</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManager;
