import React from 'react';
import { Card, Typography, theme } from 'antd';
import { PieChart, Pie, Cell, Label, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const StatusPieChart = ({ statusData, totalRequests }) => {
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
                    <p style={{ margin: 0, fontWeight: 'bold', color: token.colorText }}>{payload[0].name}</p>
                    <p style={{ margin: 0, color: payload[0].payload.color }}>
                        {`Value: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
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
    );
};

export default StatusPieChart;
