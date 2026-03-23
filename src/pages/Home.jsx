import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Select, Typography, theme } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label
} from 'recharts';
import { useRequest } from '../context/RequestContext';

const { Title } = Typography;
const { Option } = Select;

// Colors for the charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']; // Indigo, Emerald, Amber, Red

const Home = () => {
    // Access the current app theme (Light or Dark)
    const { token } = theme.useToken();

    // Get request data from our centralized RequestContext
    const { requests, updateRequestStatus } = useRequest();

    // --- Statistics Logic ---
    // Calculate counts for each status to display in summary cards
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const processingRequests = requests.filter(r => r.status === 'processing').length;
    const completedRequests = requests.filter(r => r.status === 'success').length;
    const delayRequests = requests.filter(r => r.status === 'delay').length;

    // Data for the Pie Chart (Status Distribution)
    // We filter out statuses with 0 counts to keep the chart clean
    const statusData = [
        { name: 'Pending', value: pendingRequests, color: '#f59e0b' }, // Amber
        { name: 'Processing', value: processingRequests, color: '#6366f1' }, // Indigo
        { name: 'Success', value: completedRequests, color: '#10b981' }, // Emerald
        { name: 'Delay', value: delayRequests, color: '#ef4444' }, // Red
    ].filter(d => d.value > 0);

    const [selectedMonth, setSelectedMonth] = useState('All');

    // --- Chart Data Generation ---
    // Generate mock data for the last 12 months for the Bar Chart
    // useMemo prevents re-calculating this heavily on every render
    const last12MonthsData = useMemo(() => {
        const months = [];
        const today = new Date();

        // Loop back 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            months.push({
                name: monthName,
                // Generate a random number of requests between 5 and 20 for demo purposes 
                requests: Math.floor(Math.random() * 15) + 5
            });
        }
        return months;
    }, []);

    // Logic to filter the Bar Chart data based on user selection
    const filteredChartData = useMemo(() => {
        // 1. If "All Months" is selected, show the full 12-month summary
        if (selectedMonth === 'All') return last12MonthsData;

        // 2. Drill-down Logic: If a specific month is selected, generate daily data
        const selectedMonthData = last12MonthsData.find(d => d.name === selectedMonth);
        const monthlyTotal = selectedMonthData ? selectedMonthData.requests : 0;

        const days = [];
        const daysInMonth = 30; // Simplified to 30 days for this demo

        // Initialize all days with 0 requests
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                name: `${i} ${selectedMonth}`,
                requests: 0
            });
        }

        // Randomly distribute the total monthly requests across the days
        // This ensures the daily data sums up to the monthly total seen in the main view
        for (let i = 0; i < monthlyTotal; i++) {
            const randomDayIndex = Math.floor(Math.random() * daysInMonth);
            days[randomDayIndex].requests += 1;
        }

        return days;
    }, [selectedMonth, last12MonthsData]);

    // List of months for the dropdown filter
    const monthOptions = last12MonthsData.map(d => d.name);

    // Custom Tooltip component for the charts to match the app's theme
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: token.colorBgElevated,
                    padding: '10px',
                    borderRadius: token.borderRadius,
                    boxShadow: token.boxShadowSecondary
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: token.colorText }}>{label}</p>
                    <p style={{ margin: 0, color: payload[0].fill }}>
                        {`${payload[0].name}: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Configuration for the Recent Requests Table columns
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Type',
            dataIndex: 'emergencyType',
            key: 'emergencyType',
            filters: [
                { text: 'Medical', value: 'medical' },
                { text: 'Fire', value: 'fire' },
                { text: 'Flood', value: 'flood' },
                { text: 'Rescue', value: 'rescue' },
            ],
            onFilter: (value, record) => record.emergencyType?.includes(value),
            render: (types) => (
                // Display emergency types as blue tags
                <>{types.map(type => <Tag color="cyan" key={type}>{type.toUpperCase()}</Tag>)}</>
            ),
        },
        {
            title: 'Urgency',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.urgencyLevel === value,
            render: (urgency) => {
                // Color-code urgency levels
                let color = urgency === 'high' ? 'red' : urgency === 'medium' ? 'orange' : 'green';
                return <Tag color={color}>{urgency.toUpperCase()}</Tag>;
            },
        },
        { title: 'People', dataIndex: 'numberOfPeople', key: 'numberOfPeople' },
        { title: 'Location', dataIndex: 'location', key: 'location' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Success', value: 'success' },
                { text: 'Delay', value: 'delay' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => (
                // Dropdown to change the status of a request
                <Select
                    defaultValue={status}
                    style={{ width: 120 }}
                    onChange={(value) => updateRequestStatus(record.id, value)}
                >
                    <Option value="pending"><Tag color="orange">PENDING</Tag></Option>
                    <Option value="processing"><Tag color="blue">PROCESSING</Tag></Option>
                    <Option value="delay"><Tag color="red">DELAY</Tag></Option>
                    <Option value="success"><Tag color="green">SUCCESS</Tag></Option>
                </Select>
            ),
        }
    ];

    // Sort requests so that 'success' status items are pushed to the bottom of the table
    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => {
            if (a.status === 'success' && b.status !== 'success') return 1;
            if (a.status !== 'success' && b.status === 'success') return -1;
            return 0; // Maintain original order for other statuses
        });
    }, [requests]);

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24, fontSize: 24 }}>Dashboard Overview</Title>

            {/* --- Statistic Cards Row --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Total Requests" value={totalRequests} prefix={<span style={{ fontSize: 24 }}>📝</span>} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Pending" value={pendingRequests} valueStyle={{ color: '#f59e0b' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Processing" value={processingRequests} valueStyle={{ color: '#6366f1' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Completed" value={completedRequests} valueStyle={{ color: '#10b981' }} />
                    </Card>
                </Col>
            </Row>

            {/* --- Charts Row --- */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>

                {/* 1. Requests Trend Bar Chart */}
                <Col xs={24} lg={15}>
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>Requests Trend (Last 12 Months)</Title>}
                        extra={
                            <Select defaultValue="All" style={{ width: 120 }} onChange={setSelectedMonth}>
                                <Option value="All">All Months</Option>
                                {monthOptions.map(month => (
                                    <Option key={month} value={month}>{month}</Option>
                                ))}
                            </Select>
                        }
                        bordered={false}
                        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                                {/* Use our custom tooltip */}
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="requests" fill="url(#colorRequests)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* 2. Status Distribution Pie Chart */}
                <Col xs={24} lg={9}>
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>Status Distribution</Title>}
                        bordered={false}
                        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                    {/* Text in the center of the Donut Chart */}
                                    <Label
                                        value={totalRequests}
                                        position="center"
                                        dy={-10}
                                        style={{ fontSize: '32px', fontWeight: 'bold', fill: token.colorText }}
                                    />
                                    <Label
                                        value="Requests"
                                        position="center"
                                        dy={15}
                                        style={{ fontSize: '14px', fill: token.colorTextSecondary }}
                                    />
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* --- Recent Requests Table --- */}
            <Card title="Recent Requests" bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Table
                    dataSource={sortedRequests}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: true }}
                />
            </Card>
        </div>
    );
};

export default Home;
