import React from 'react';
import { Typography, Card, Row, Col, Statistic, Button, Tag, Space } from 'antd';
import { WarningOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { useDangerZone } from '../context/DangerZoneContext';

const { Title, Text } = Typography;

const DangerZone = () => {
    // Context to get and manage danger zones
    const { dangerZones, approveZone, rejectZone } = useDangerZone();

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

            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: 0, overflow: 'hidden' }}>
                {/* 
                    MapContainer center is default set to Sri Lanka coordinates 
                    Height must be set for the map to render.
                    maxBounds restricts the user from panning outside of Sri Lanka.
                */}
                <MapContainer 
                    center={[7.8731, 80.7718]} 
                    zoom={7} 
                    style={{ height: '600px', width: '100%' }}
                    minZoom={7}
                    maxBounds={[
                        [5.8, 79.5], // South West coordinates of Sri Lanka bounding box
                        [9.9, 82.0]  // North East coordinates of Sri Lanka bounding box
                    ]}
                    maxBoundsViscosity={1.0} // Makes the bounding box completely solid so you can't bounce outside
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {dangerZones.map(zone => (
                        <Marker key={zone.id} position={zone.coordinates}>
                            <Popup>
                                <div style={{ minWidth: 200 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <h3 style={{ margin: 0, color: zone.severity === 'Critical' ? '#ff4d4f' : '#faad14' }}>
                                            {zone.name}
                                        </h3>
                                        {zone.status === 'pending' && <Tag color="orange">Pending</Tag>}
                                        {zone.status === 'approved' && <Tag color="green">Approved</Tag>}
                                    </div>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Severity:</strong> {zone.severity}</p>
                                    <p style={{ margin: '0 0 12px 0' }}>{zone.description}</p>
                                    
                                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                                        {zone.status !== 'approved' && (
                                            <Button 
                                                type="primary" 
                                                size="small" 
                                                icon={<CheckCircleOutlined />}
                                                style={{ backgroundColor: '#52c41a' }}
                                                onClick={() => approveZone(zone.id)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {zone.status !== 'rejected' && (
                                            <Button 
                                                type="primary" 
                                                danger 
                                                size="small" 
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => rejectZone(zone.id)}
                                            >
                                                Reject
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Card>
        </div>
    );
};

export default DangerZone;
