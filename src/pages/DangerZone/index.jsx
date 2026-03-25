import React from 'react';
import { Typography, Row, Col, Statistic, Card } from 'antd';
import { WarningOutlined, EnvironmentOutlined } from '@ant-design/icons';
import DangerZoneMap from '../../components/dangerZone/DangerZoneMap';
import { useDangerZone } from '../../context/DangerZoneContext';

const { Title } = Typography;

const DangerZone = () => {
    const { dangerZones } = useDangerZone();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Danger Zone Map
                </Title>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Total Active Zones" value={dangerZones.length} prefix={<EnvironmentOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Critical Areas" value={dangerZones.filter(z => z.severity === 'Critical').length} valueStyle={{ color: '#ff4d4f' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="High Risk Areas" value={dangerZones.filter(z => z.severity === 'High').length} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={24}>
                    <DangerZoneMap />
                </Col>
            </Row>
        </div>
    );
};

export default DangerZone;
