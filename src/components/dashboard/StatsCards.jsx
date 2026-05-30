import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';

const StatsCards = ({ totalRequests, pendingRequests, inProgressRequests, completedRequests }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Statistic title="Total Requests" value={totalRequests} prefix={<span style={{ fontSize: 24 }}></span>} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Statistic title="Pending" value={pendingRequests} valueStyle={{ color: '#f59e0b' }} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Statistic title="In Progress" value={inProgressRequests} valueStyle={{ color: '#3b82f6' }} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Statistic title="Completed" value={completedRequests} valueStyle={{ color: '#10b981' }} />
                </Card>
            </Col>
        </Row>
    );
};

export default StatsCards;
