import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card, Tooltip, Descriptions, Switch, Row, Col } from 'antd';
import { PlusOutlined, UserAddOutlined, SearchOutlined, EditOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
    // Access user management functions from UserContext
    const { users, addUser, updateUser, updateUserStatus, refreshUsers } = useUser();
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

    // Ant Design Form instance to manage form data and validation
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch users from backend when the page mounts
        const load = async () => {
            if (typeof refreshUsers === 'function') {
                const ok = await refreshUsers();
                if (!ok) message.error('Failed to fetch users from backend');
            }
        };
        load();
    }, [refreshUsers]);

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

        const isCurrentUserSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'super admin' || currentUser?.role === 'Co-Admin' || currentUser?.role === 'co-admin';
        const isTargetUserAdmin = u.role === 'Admin' || u.role === 'admin';

        // Super Admins cannot see Admins
        if (isCurrentUserSuperAdmin && isTargetUserAdmin) {
            return false;
        }

        return matchesSearch;
    });



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
                { text: 'Super Admin', value: 'Super Admin' },
                { text: 'User', value: 'User' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => {
                // Color-code roles for better visibility
                let color = role === 'Admin' ? 'red' : (role === 'Super Admin' || role === 'Co-Admin') ? 'blue' : 'green';
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
                const isCurrentUserSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'super admin' || currentUser?.role === 'Co-Admin' || currentUser?.role === 'co-admin';
                const isTargetAdmin = record.role === 'Admin' || record.role === 'admin';
                const isTargetSuperAdmin = record.role === 'Super Admin' || record.role === 'super admin' || record.role === 'Co-Admin' || record.role === 'co-admin';
                const isActive = record.status === 'Active' || record.status === 'Activate';

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
                                disabled={isTargetAdmin || (isCurrentUserSuperAdmin && isTargetSuperAdmin)}
                            />
                        </Tooltip>
                        <Tooltip title={isActive ? "Deactivate User" : "Activate User"}>
                            <Switch
                                checked={isActive}
                                disabled={isTargetAdmin || (isCurrentUserSuperAdmin && isTargetSuperAdmin)}
                                onChange={async (checked) => {
                                    try {
                                        const newStatus = checked ? 'Activate' : 'Deactivate';
                                        await updateUserStatus(record.id, record.email, newStatus, checked);
                                        message.success(`User ${newStatus.toLowerCase()}d successfully`);
                                    } catch (error) {
                                        message.error('Failed to update user status');
                                    }
                                }}
                            />
                        </Tooltip>

                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* --- Page Header with Search and Add Button --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>User Management</Title>

                <Space size="middle">
                    <Input.Search
                        placeholder="Search users..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 350 }}
                    />
                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                        New User
                    </Button>
                </Space>
            </div>

            {/* --- Users List Table --- */}
            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Table 
                    columns={columns} 
                    dataSource={filteredUsers} 
                    rowKey={(record) => record.id || record.email || Math.random().toString()} 
                />
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
                            <Option value="Super Admin">Super Admin</Option>
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
                        <Input disabled />
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
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>{viewingUser?.name}</span>
                        <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>{viewingUser?.id ? `ID: ${viewingUser.id}` : ''}</span>
                    </div>
                }
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
                    <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>First Name</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.firstName || viewingUser.name?.split(' ')[0] || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Email</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.email || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Home Location</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.homeLocation || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Safety Status</Typography.Text>
                                    {viewingUser.isSafe === true ? (
                                        <Tag color="success" style={{ margin: 0 }}>YES</Tag>
                                    ) : viewingUser.isSafe === false ? (
                                        <Tag color="error" style={{ margin: 0 }}>NO</Tag>
                                    ) : (
                                        <Tag color="default" style={{ margin: 0 }}>UNKNOWN</Tag>
                                    )}
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Last Name</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.lastName || viewingUser.name?.split(' ').slice(1).join(' ') || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Mobile Number</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.mobileNumber || viewingUser.contact || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Current Location</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{viewingUser.currentLocation || '—'}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Updated At</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>
                                        {viewingUser.updatedOn
                                            ? new Date(viewingUser.updatedOn).toLocaleString()
                                            : viewingUser.updatedAt
                                                ? new Date(viewingUser.updatedAt).toLocaleString()
                                                : '—'}
                                    </Typography.Text>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Users;
