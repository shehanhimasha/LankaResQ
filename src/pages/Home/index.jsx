import React from 'react';
import { Typography, Row, Col, theme } from 'antd';
import useDashboard from '../../hooks/useDashboard';
import StatsCards from '../../components/dashboard/StatsCards';
import RequestsLineChart from '../../components/dashboard/RequestsLineChart';
import StatusPieChart from '../../components/dashboard/StatusPieChart';
import RecentRequestsTable from '../../components/dashboard/RecentRequestsTable';

const { Title } = Typography;

const Home = () => {
    const {
        totalRequests,
        pendingRequests,
        processingRequests,
        completedRequests,
        statusData,
        selectedMonth,
        setSelectedMonth,
        filteredChartData,
        monthOptions,
        sortedRequests,
        updateRequestStatus
    } = useDashboard();
    const { token: { colorBgContainer } } = theme.useToken();

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={3} style={{ marginBottom: 24 }}>Dashboard Overview</Title>

            <StatsCards 
                totalRequests={totalRequests} 
                pendingRequests={pendingRequests} 
                processingRequests={processingRequests} 
                completedRequests={completedRequests} 
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} lg={15}>
                    <RequestsLineChart 
                        filteredChartData={filteredChartData}
                        monthOptions={monthOptions}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                    />
                </Col>
                <Col xs={24} lg={9}>
                    <StatusPieChart 
                        statusData={statusData}
                        totalRequests={totalRequests}
                    />
                </Col>
            </Row>

            <RecentRequestsTable 
                sortedRequests={sortedRequests}
                updateRequestStatus={updateRequestStatus}
            />
        </div>
    );
};

export default Home;
