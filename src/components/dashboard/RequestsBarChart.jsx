import React from 'react';
import { Card, Typography, Select, theme } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;
const { Option } = Select;

const RequestsBarChart = ({ filteredChartData, monthOptions, selectedMonth, setSelectedMonth }) => {
    const { token } = theme.useToken();

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

    return (
        <Card
            title={<Title level={4} style={{ margin: 0 }}>Requests Trend (Last 12 Months)</Title>}
            extra={
                <Select value={selectedMonth} style={{ width: 120 }} onChange={setSelectedMonth}>
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
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="requests" fill="url(#colorRequests)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default RequestsBarChart;
