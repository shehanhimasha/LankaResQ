import React from 'react';
import { Typography, Row, Col, Statistic, Card, theme } from 'antd';
import { WarningOutlined, EnvironmentOutlined } from '@ant-design/icons';
import DangerZoneMap from '../../components/dangerZone/DangerZoneMap';
import { useDangerZone } from '../../context/DangerZoneContext';

const { Title } = Typography;

const DangerZone = () => {
    const { dangerZones } = useDangerZone();
    const { token: { colorBgContainer } } = theme.useToken();

    // Filter zones that have a valid location on the map (coordinates not [0,0])
    const zonesWithLocation = dangerZones.filter(z => 
        z.coordinates && (z.coordinates[0] !== 0 || z.coordinates[1] !== 0)
    );

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <WarningOutlined style={{ marginRight: 8 }} />
                    Danger Zone Map
                </Title>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Total Active Zones" value={zonesWithLocation.length} prefix={<EnvironmentOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="Critical Areas" value={zonesWithLocation.filter(z => z.severity === 'Critical').length} valueStyle={{ color: '#ff4d4f' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Statistic title="High Risk Areas" value={zonesWithLocation.filter(z => z.severity === 'High').length} valueStyle={{ color: '#faad14' }} />
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
