import React, { useState } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useTableSearch } from '../utils/tableUtils';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
    // Access user management functions from UserContext
    const { users, addUser, updateUser, deleteUser } = useUser();
    const { user: currentUser } = useAuth();
    const getColumnSearchProps = useTableSearch();

    // State to control the visibility of the "Add User" modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm] = Form.useForm();

    // State for the search bar text
    const [searchText, setSearchText] = useState('');

    // Ant Design Form instance to manage form data and validation
    const [form] = Form.useForm();

    // Handler for form submission (adding a new user)
    const handleAddUser = (values) => {
        addUser(values);
        message.success('User added successfully');
        setIsModalVisible(false); // Close the modal
        form.resetFields(); // Clear the form
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

    const handleEditSubmit = (values) => {
        updateUser(editingUser.id, values);
        message.success('User profile updated successfully');
        setIsEditModalVisible(false);
        setEditingUser(null);
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
            onOk() {
                deleteUser(id);
                message.success('User deleted');
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
            ...getColumnSearchProps('name', 'Name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email', 'Email'),
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
            ...getColumnSearchProps('role', 'Role'),
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
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleEditClick(record)}
                            disabled={isTargetAdmin || (isCurrentUserCoAdmin && isTargetCoAdmin)}
                        >
                            Edit
                        </Button>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                            disabled={isTargetAdmin || (isCurrentUserCoAdmin && isTargetCoAdmin)}
                        >
                            Delete
                        </Button>
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
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)} size="large">
                    Add New User
                </Button>
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
        </div>
    );
};

export default Users;
