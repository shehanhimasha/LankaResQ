import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card, Tooltip, Descriptions } from 'antd';
import { PlusOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EditOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
    // Access user management functions from UserContext
    const { users, addUser, updateUser, deleteUser, refreshUsers } = useUser();
    const { user: currentUser } = useAuth();

    // State to control the visibility of the "Add User" modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm] = Form.useForm();
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    // State for the search bar text
    const [searchText, setSearchText] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ant Design Form instance to manage form data and validation
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch users from backend when the page mounts
        const load = async () => {
            if (typeof refreshUsers === 'function') {
                setIsRefreshing(true);
                const ok = await refreshUsers();
                setIsRefreshing(false);
                if (!ok) message.error('Failed to fetch users from backend');
            }
        };
        load();
    }, []);

    // Handler for form submission (adding a new user)
    const handleAddUser = async (values) => {
        try {
            await addUser(values);
            message.success('User added successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'Failed to add user');
        }
    };

    const handleEditClick = (record) => {
        setEditingUser(record);
        editForm.setFieldsValue({
            name: record.name,
            email: record.email,
            contact: record.contact || '',
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            await updateUser(editingUser.id, values);
            message.success('User profile updated successfully');
            setIsEditModalVisible(false);
            setEditingUser(null);
        } catch (error) {
            message.error(error.message || 'Failed to update user');
        }
    };

    // Filter users list based on search text and RBAC
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) ||
            u.email.toLowerCase().includes(searchText.toLowerCase());

        const isCurrentUserCoAdmin = currentUser?.role === 'Co-Admin' || currentUser?.role === 'co-admin';
        const isTargetUserAdmin = u.role === 'Admin' || u.role === 'admin';

        // Co-Admins cannot see Admins
        if (isCurrentUserCoAdmin && isTargetUserAdmin) {
            return false;
        }

        return matchesSearch;
    });

    // Handler for deleting a user with a confirmation dialog
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this user?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    await deleteUser(id);
                    message.success('User deleted');
                } catch (error) {
                    message.error(error.message || 'Failed to delete user');
                }
            },
        });
    };

    // Configuration for the Users Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filters: Array.from(new Set(users.map(u => u.name))).map(n => ({ text: n, value: n })),
            onFilter: (value, record) => record.name === value,
            filterSearch: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            filters: Array.from(new Set(users.map(u => u.email))).map(e => ({ text: e, value: e })),
            onFilter: (value, record) => record.email === value,
            filterSearch: true,
        },
        {
            title: 'Contact No',
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'Co-Admin', value: 'Co-Admin' },
                { text: 'User', value: 'User' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => {
                // Color-code roles for better visibility
                let color = role === 'Admin' ? 'red' : role === 'Co-Admin' ? 'blue' : 'green';
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === 'Active' ? 'success' : 'default'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Joined Date',
            dataIndex: 'joinedDate',
            key: 'joinedDate',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const isCurrentUserCoAdmin = currentUser?.role === 'Co-Admin' || currentUser?.role === 'co-admin';
                const isTargetAdmin = record.role === 'Admin' || record.role === 'admin';
                const isTargetCoAdmin = record.role === 'Co-Admin' || record.role === 'co-admin';

                return (
                    <Space size="middle">
                        <Tooltip title="View">
                            <Button
                                type="default"
                                style={{ color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' }}
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setViewingUser(record);
                                    setIsViewModalVisible(true);
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Edit">
                            <Button
                                type="default"
                                style={{ color: '#1890ff', borderColor: '#91d5ff', background: '#e6f7ff' }}
                                icon={<EditOutlined />}
                                onClick={() => handleEditClick(record)}
                                disabled={isTargetAdmin || (isCurrentUserCoAdmin && isTargetCoAdmin)}
                            />
                        </Tooltip>
                        <Tooltip title="Delete">
                            <Button
                                type="default"
                                danger
                                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0' }}
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record.id)}
                                disabled={isTargetAdmin || (isCurrentUserCoAdmin && isTargetCoAdmin)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            {/* --- Page Header with Search and Add Button --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={2} style={{ margin: 0 }}>User Management</Title>
                    {/* Search Bar */}
                    <Input
                        placeholder="Search users..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        onClick={async () => {
                            if (typeof refreshUsers !== 'function') return;
                            setIsRefreshing(true);
                            const ok = await refreshUsers();
                            setIsRefreshing(false);
                            if (ok) message.success('Refreshed from backend');
                            else message.error('Failed to refresh users from backend');
                        }}
                        size="large"
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)} size="large">
                        Add New User
                    </Button>
                </div>
            </div>

            {/* --- Users List Table --- */}
            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Table columns={columns} dataSource={filteredUsers} rowKey="id" />
            </Card>

            {/* --- Add User Modal --- */}
            <Modal
                title="Add New User"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null} // We use custom buttons inside the form
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddUser}
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter the name' }]}
                    >
                        <Input placeholder="John Doe" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter the email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="contact"
                        label="Contact No"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input placeholder="07XXXXXXXX" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        initialValue="User"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select>
                            <Option value="Admin">Admin</Option>
                            <Option value="Co-Admin">Co-Admin</Option>
                            <Option value="User">User</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Add User
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            {/* --- Edit User Modal --- */}
            <Modal
                title="Update User Details"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingUser(null);
                }}
                footer={null}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter the name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter the email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="contact"
                        label="Contact No"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Save Changes</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            {/* --- View User Modal --- */}
            <Modal
                title="User Details"
                open={isViewModalVisible}
                onCancel={() => {
                    setIsViewModalVisible(false);
                    setViewingUser(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setIsViewModalVisible(false);
                        setViewingUser(null);
                    }}>
                        Close
                    </Button>
                ]}
                width={600}
                centered
            >
                {viewingUser && (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        style={{ marginTop: 16 }}
                        labelStyle={{ fontWeight: 600, width: '40%' }}
                    >
                        <Descriptions.Item label="First Name">
                            {viewingUser.firstName || viewingUser.name?.split(' ')[0] || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Name">
                            {viewingUser.lastName || viewingUser.name?.split(' ').slice(1).join(' ') || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {viewingUser.email || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mobile Number">
                            {viewingUser.mobileNumber || viewingUser.contact || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Home Location">
                            {viewingUser.homeLocation || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Current Location">
                            {viewingUser.currentLocation || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Safety Status">
                            {viewingUser.isSafe === true ? (
                                <Tag color="success" style={{ fontSize: '13px', padding: '2px 12px' }}>Yes</Tag>
                            ) : viewingUser.isSafe === false ? (
                                <Tag color="error" style={{ fontSize: '13px', padding: '2px 12px' }}>No</Tag>
                            ) : (
                                <Tag color="default" style={{ fontSize: '13px', padding: '2px 12px' }}>Unknown</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Updated At">
                            {viewingUser.updatedOn
                                ? new Date(viewingUser.updatedOn).toLocaleString()
                                : viewingUser.updatedAt
                                    ? new Date(viewingUser.updatedAt).toLocaleString()
                                    : '—'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Users;
