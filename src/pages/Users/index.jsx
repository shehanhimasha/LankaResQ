import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card, Tooltip, Descriptions, Switch, Row, Col, Upload, Avatar, theme, Popconfirm } from 'antd';
import { PlusOutlined, UserAddOutlined, SearchOutlined, EditOutlined, ReloadOutlined, EyeOutlined, UploadOutlined, UserOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const parseCoordinates = (locStr) => {
    if (!locStr) return null;
    const matches = locStr.match(/(-?\d+(?:\.\d+)?)/g);
    if (matches && matches.length >= 2) {
        const num1 = parseFloat(matches[0]);
        const num2 = parseFloat(matches[1]);
        if (!isNaN(num1) && !isNaN(num2)) {
            // Auto-detect based on absolute values (latitude is smaller than longitude in Sri Lanka/most regions)
            if (Math.abs(num1) < Math.abs(num2)) {
                return { lat: num1, lng: num2 };
            } else {
                return { lat: num2, lng: num1 };
            }
        }
    }
    return null;
};

const Users = () => {
    // Access user management functions from UserContext
    const { users, totalUsers, addUser, registerUser, updateUser, deleteUser, refreshUsers } = useUser();
    const { user: currentUser } = useAuth();
    const { token: { colorBgContainer, colorFillAlter } } = theme.useToken();
    const navigate = useNavigate();

    // Pagination and Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

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
        // Fetch users from backend when the page mounts or filters change
        const load = async () => {
            if (typeof refreshUsers === 'function') {
                setLoading(true);
                try {
                    await refreshUsers({
                        Query: searchText,
                        Page: currentPage,
                        PageSize: pageSize
                    });
                } catch (error) {
                    message.error('Failed to fetch users from backend');
                } finally {
                    setLoading(false);
                }
            }
        };

        // Debounce search input to avoid excessive API calls
        const timeoutId = setTimeout(() => {
            load();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [refreshUsers, searchText, currentPage, pageSize]);

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    // Handler for form submission (adding a new user)
    const handleAddUser = async (values) => {
        try {
            const formData = new FormData();
            formData.append('FirstName', values.firstName);
            formData.append('LastName', values.lastName);
            formData.append('Email', values.email);
            formData.append('MobileNumber', values.mobileNumber);
            formData.append('Password', values.password);
            formData.append('RoleId', values.roleId);

            // These fields are removed from the form but still sent as defaults to the API
            formData.append('HomeLocation', '');
            formData.append('CurrentLocation', '');
            formData.append('IsVerified', 'false');
            formData.append('IsSafe', 'true');
            // ProfilePicture is not added here as per user request

            await registerUser(formData);
            message.success('User registered successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.message || 'Failed to register user');
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
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

    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id);
            message.success('User deleted successfully');
            if (typeof refreshUsers === 'function') {
                refreshUsers({ Query: searchText, Page: currentPage, PageSize: pageSize });
            }
        } catch (error) {
            message.error(error.message || 'Failed to delete user');
        }
    };

    // Filter users list based on search text and RBAC
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) ||
            u.email.toLowerCase().includes(searchText.toLowerCase());

        const isCurrentUserAdminOnly = currentUser?.role === 'Admin' || currentUser?.role === 'admin' || currentUser?.roleId === 2;
        const isTargetSuperAdmin = u.role === 'Super Admin' || u.role === 'super admin' || u.role === 'Co-Admin' || u.role === 'co-admin' || u.roleId === 1 || u.roleId === 3;

        // Admins cannot see Super Admins
        if (isCurrentUserAdminOnly && isTargetSuperAdmin) {
            return false;
        }

        return matchesSearch;
    });



    // Configuration for the Users Table columns
    const columns = [
        {
            title: 'First Name',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: true,
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Mobile No',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = role === 'Admin' ? 'red' : (role === 'Super Admin' || role === 'Co-Admin') ? 'blue' : 'green';
                return <Tag color={color}>{role ? role.toUpperCase() : 'USER'}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => {
                const isCurrentUserSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'super admin' || currentUser?.role === 'Co-Admin' || currentUser?.role === 'co-admin' || currentUser?.roleId === 1 || currentUser?.roleId === 3;
                const isCurrentUserAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'admin' || currentUser?.roleId === 2;
                const isTargetAdmin = record.role === 'Admin' || record.role === 'admin' || record.roleId === 2;
                const isTargetSuperAdmin = record.role === 'Super Admin' || record.role === 'super admin' || record.role === 'Co-Admin' || record.role === 'co-admin' || record.roleId === 1 || record.roleId === 3;
                const isTargetUser = !record.role || record.role.toLowerCase() === 'user' || record.roleId === 4;

                let canShowDelete = false;
                if (!isTargetUser) {
                    if (isCurrentUserSuperAdmin) {
                        // Super Admin can delete Admin (assuming they can also delete other Super Admins or not, but requirement says "both admin and users")
                        // We will allow Super Admins to delete anyone for now, or just disable if target is Super Admin to be safe
                        canShowDelete = true;
                    } else if (isCurrentUserAdmin) {
                        // Admin can delete, but NOT super admins
                        canShowDelete = !isTargetSuperAdmin;
                    }
                }

                let isEditDisabled = true;
                if (isCurrentUserSuperAdmin) {
                    isEditDisabled = false; // Super Admin can edit anyone
                } else if (isCurrentUserAdmin) {
                    isEditDisabled = isTargetSuperAdmin; // Admin cannot edit Super Admin
                }

                return (
                    <Space size="small">
                        <Tooltip title="View">
                            <Button
                                type="default"
                                size="small"
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
                                size="small"
                                style={{ color: '#1890ff', borderColor: '#91d5ff', background: '#e6f7ff' }}
                                icon={<EditOutlined />}
                                onClick={() => handleEditClick(record)}
                                disabled={isEditDisabled}
                            />
                        </Tooltip>
                        {canShowDelete && (
                            <Popconfirm
                                title="Delete the user"
                                description="Are you sure to delete this user?"
                                onConfirm={() => handleDeleteUser(record.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Tooltip title="Delete">
                                    <Button
                                        type="default"
                                        size="small"
                                        danger
                                        style={{ color: '#ff4d4f', borderColor: '#ffa39e', background: '#fff1f0' }}
                                        icon={<DeleteOutlined />}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* --- Page Header with Search and Add Button --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>User Management</Title>

                <Space size="middle">
                    <Input.Search
                        placeholder="Search by name or email..."
                        allowClear
                        value={searchText}
                        onChange={e => {
                            setSearchText(e.target.value);
                            setCurrentPage(1);
                        }}
                        onSearch={() => setCurrentPage(1)}
                        style={{ width: 300 }}
                    />
                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                        New User
                    </Button>
                </Space>
            </div>

            {/* --- Users List Table --- */}
            <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey={(record) => record.id || record.email || Math.random().toString()}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalUsers,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} users`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
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
                    initialValues={{
                        roleId: 1, // Default to Admin role
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="John" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Doe" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter the email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="john.doe@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="mobileNumber"
                        label="Mobile Number"
                        rules={[{ required: true, message: 'Please enter mobile number' }]}
                    >
                        <Input placeholder="07XXXXXXXX" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select a role">
                            <Option value={1}>Super Admin</Option>
                            <Option value={2}>Admin</Option>
                            <Option value={3}>Co-Admin</Option>
                            <Option value={4}>User</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Register User
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
                    <div style={{ marginTop: '24px', padding: '16px', background: colorFillAlter, borderRadius: '8px' }}>
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
                                        <Tag color="success" style={{ margin: 0 }}>SAFE</Tag>
                                    ) : viewingUser.isSafe === false ? (
                                        <Tag color="error" style={{ margin: 0 }}>NOT SAFE</Tag>
                                    ) : (
                                        <Tag color="default" style={{ margin: 0 }}>UNKNOWN</Tag>
                                    )}
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Created On</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>
                                        {viewingUser.createdOn
                                            ? new Date(viewingUser.createdOn).toLocaleString()
                                            : viewingUser.createdAt
                                                ? new Date(viewingUser.createdAt).toLocaleString()
                                                : '—'}
                                    </Typography.Text>
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
