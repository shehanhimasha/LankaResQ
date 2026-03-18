import React, { useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Button, Tag, Space, List, Checkbox, message } from 'antd';
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
    const { dangerZones, approveZone, rejectZone, bulkApproveZones, bulkRejectZones } = useDangerZone();
    const [selectedIds, setSelectedIds] = useState([]);

    const pendingZones = dangerZones.filter(z => z.status === 'pending');

    const handleSelect = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(pendingZones.map(z => z.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return message.warning('No locations selected');
        bulkApproveZones(selectedIds);
        setSelectedIds([]);
        message.success(`${selectedIds.length} locations approved.`);
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return message.warning('No locations selected');
        bulkRejectZones(selectedIds);
        setSelectedIds([]);
        message.success(`${selectedIds.length} locations rejected.`);
    };

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
                <Col xs={24} lg={16}>
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
                    
                    {dangerZones.map(zone => {
                        const isPending = zone.status === 'pending';
                        const isSelected = selectedIds.includes(zone.id);
                        
                        // Create a distinct icon if it's selected
                        const markerIcon = isSelected ? L.divIcon({
                            className: 'custom-selected-marker',
                            html: `<div style="background-color: #52c41a; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">✓</div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        }) : DefaultIcon;

                        return (
                            <Marker 
                                key={zone.id} 
                                position={zone.coordinates}
                                icon={isPending && isSelected ? markerIcon : DefaultIcon}
                                opacity={isPending ? (isSelected ? 1 : 0.8) : 0.6}
                                eventHandlers={{
                                    click: () => {
                                        if (isPending) {
                                            handleSelect(zone.id, !isSelected);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: 200 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, color: zone.severity === 'Critical' ? '#ff4d4f' : '#faad14', display: 'flex', alignItems: 'center' }}>
                                                {isPending && (
                                                    <Checkbox 
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelect(zone.id, e.target.checked)}
                                                        style={{ marginRight: 8 }}
                                                    />
                                                )}
                                                {zone.name}
                                            </h3>
                                            {isPending && <Tag color="orange">Pending</Tag>}
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
                                                    onClick={() => {
                                                        approveZone(zone.id);
                                                        // if it was selected, remove from selected
                                                        setSelectedIds(prev => prev.filter(id => id !== zone.id));
                                                    }}
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
                                                    onClick={() => {
                                                        rejectZone(zone.id);
                                                        setSelectedIds(prev => prev.filter(id => id !== zone.id));
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            )}
                                        </Space>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card 
                        title="Pending Locations" 
                        extra={
                            <Checkbox 
                                onChange={handleSelectAll} 
                                checked={selectedIds.length > 0 && selectedIds.length === pendingZones.length}
                                indeterminate={selectedIds.length > 0 && selectedIds.length < pendingZones.length}
                            >
                                Select All
                            </Checkbox>
                        }
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        bodyStyle={{ flex: 1, overflowY: 'auto', padding: '12px' }}
                    >
                        <List
                            dataSource={pendingZones}
                            locale={{ emptyText: 'No pending locations' }}
                            renderItem={zone => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Checkbox 
                                                checked={selectedIds.includes(zone.id)} 
                                                onChange={e => handleSelect(zone.id, e.target.checked)} 
                                            />
                                        }
                                        title={zone.name}
                                        description={
                                            <>
                                                <Tag color={zone.severity === 'Critical' ? 'red' : zone.severity === 'High' ? 'orange' : 'blue'} style={{ marginBottom: 4 }}>
                                                    {zone.severity}
                                                </Tag>
                                                <br/>
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{zone.description}</Typography.Text>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button 
                                    type="primary" 
                                    onClick={handleBulkApprove} 
                                    disabled={selectedIds.length === 0} 
                                    style={{ backgroundColor: selectedIds.length > 0 ? '#52c41a' : undefined, flex: 1, minWidth: '120px' }}
                                    icon={<CheckCircleOutlined />}
                                >
                                    Approve Selected
                                </Button>
                                <Button 
                                    danger 
                                    type="primary" 
                                    onClick={handleBulkReject} 
                                    disabled={selectedIds.length === 0}
                                    style={{ flex: 1, minWidth: '120px' }}
                                    icon={<CloseCircleOutlined />}
                                >
                                    Reject Selected
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DangerZone;
