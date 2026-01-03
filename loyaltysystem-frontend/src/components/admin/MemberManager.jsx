import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const MemberManager = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [search, setSearch] = useState('');
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [form] = Form.useForm();

    const fetchMembers = async (page = 1, term = search) => {
        setLoading(true);
        try {
            const params = { page };
            if (term) {
                params.search = term;
            }
            const response = await api.get('/members', { params });
            const payload = response.data?.data || {};
            const rows = Array.isArray(payload.data) ? payload.data : [];
            setMembers(rows);
            setPagination({
                current: payload.current_page || page,
                pageSize: payload.per_page || pagination.pageSize,
                total: payload.total || rows.length,
            });
        } catch (error) {
            message.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/branches');
            setBranches(response.data.data || []);
        } catch (error) {
            message.error('Failed to load branches');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            // Filter to only show users with 'member' role
            const memberUsers = (response.data.data || []).filter(u => u.role === 'member');
            setUsers(memberUsers);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchBranches();
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setEditingMember(null);
        form.resetFields();
        form.setFieldsValue({ status: 'active' });
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingMember(record);
        form.setFieldsValue({
            ...record,
            user_id: record.user?.id || null,
            branch_id: record.branch_id || record.branch?.id || null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/members/${id}`);
            message.success('Member deleted');
            fetchMembers(pagination.current);
        } catch (error) {
            message.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingMember) {
                await api.put(`/members/${editingMember.id}`, values);
                message.success('Member updated');
            } else {
                await api.post('/members', values);
                message.success('Member created');
            }
            setIsModalVisible(false);
            fetchMembers(pagination.current);
        } catch (error) {
            if (error?.errorFields) return;
            const msg = error.response?.data?.message || 'Operation failed';
            message.error(msg);
        }
    };
    const handleSearch = (value) => {
        const term = value.trim();
        setSearch(term);
        fetchMembers(1, term);
    };

    const columns = [
        { title: 'Member Code', dataIndex: 'member_code', key: 'member_code' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Branch',
            key: 'branch',
            render: (_, record) => record.branch?.name || record.branch || '-',
        },
        {
            title: 'Branch Code',
            key: 'branch_code',
            render: (_, record) => record.branch?.code || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'active') color = 'green';
                if (status === 'inactive') color = 'orange';
                if (status === 'suspended') color = 'red';
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Linked User',
            key: 'user',
            render: (_, record) => record.user?.email || record.user?.id || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete member?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <h2>Member Enrollment</h2>
                <Space>
                    <Input.Search
                        placeholder="Search members"
                        allowClear
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 260 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Member</Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={members}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchMembers(page),
                }}
            />

            <Modal
                title={editingMember ? 'Edit Member' : 'New Member'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="member_code" label="Member Code">
                        <Input placeholder="Leave blank to auto-generate" />
                    </Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input />
                    </Form.Item>
                    <Form.Item name="branch_id" label="Branch" rules={[{ required: true }]}>
                        <Select placeholder="Select branch">
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.code} - {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="suspended">Suspended</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="user_id" label="Link User Account (Login Access)">
                        <Select
                            placeholder="Select user to link"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {users.map((user) => (
                                <Option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MemberManager;
