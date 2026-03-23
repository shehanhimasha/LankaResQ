import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, Button, Tag, Space, message } from 'antd';
import { WarningOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Custom child component to handle drag-to-select logic on the Leaflet Map
const MapBoxSelector = ({ onAreaSelected, onMapClick }) => {
    const map = useMap();

    useEffect(() => {
        // Disable standard panning so dragging always draws the selection box
        map.dragging.disable();

        let startLatLng = null;
        let selectionRectangle = null;

        let isDragging = false;

        const handleMouseDown = (e) => {
            // Left click only
            if (e.originalEvent.button !== 0) return;
            startLatLng = e.latlng;
            isDragging = false;
        };

        const handleMouseMove = (e) => {
            if (!startLatLng) return;
            isDragging = true;
            
            if (!selectionRectangle) {
                selectionRectangle = L.rectangle([startLatLng, e.latlng], { 
                    color: '#1890ff', 
                    weight: 1, 
                    fillColor: '#1890ff', 
                    fillOpacity: 0.2,
                    dashArray: '3'
                }).addTo(map);
            } else {
                selectionRectangle.setBounds([startLatLng, e.latlng]);
            }
        };

        const handleMouseUp = (e) => {
            if (isDragging && startLatLng && selectionRectangle) {
                const bounds = L.latLngBounds(startLatLng, e.latlng);
                onAreaSelected(bounds);
                map.removeLayer(selectionRectangle);
            } else if (!isDragging && startLatLng) {
                // Fired when user just clicks without dragging
                onMapClick();
            }
            startLatLng = null;
            selectionRectangle = null;
            isDragging = false;
        };

        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
            if (selectionRectangle) map.removeLayer(selectionRectangle);
            map.dragging.enable();
        };
    }, [map, onAreaSelected, onMapClick]);

    return null;
};

const DangerZone = () => {
    // Context to get and manage danger zones
    const { dangerZones, approveZone, rejectZone, bulkApproveZones, bulkRejectZones } = useDangerZone();
    
    // State for interactive map selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkPopupPosition, setBulkPopupPosition] = useState(null);

    const pendingZones = dangerZones.filter(z => z.status === 'pending');

    // Called when the user finishes dragging a box on the map
    const handleAreaSelected = (bounds) => {
        const newlySelectedIds = [];
        pendingZones.forEach(zone => {
            const point = L.latLng(zone.coordinates[0], zone.coordinates[1]);
            if (bounds.contains(point)) {
                newlySelectedIds.push(zone.id);
            }
        });

        if (newlySelectedIds.length > 0) {
            // Merge newly selected IDs
            setSelectedIds(prev => Array.from(new Set([...prev, ...newlySelectedIds])));
            // Place popup at the top right of the selection box for visibility
            setBulkPopupPosition(bounds.getNorthEast());
            message.success(`Selected ${newlySelectedIds.length} locations within the area.`);
        }
    };

    const handleMapClick = () => {
        // Clear selection if they click an empty area on the map
        setSelectedIds([]);
        setBulkPopupPosition(null);
    };

    // Toggle individual marker selection
    const toggleMarkerSelection = (zone) => {
        setSelectedIds(prev => {
            if (prev.includes(zone.id)) {
                const newIds = prev.filter(selectedId => selectedId !== zone.id);
                if (newIds.length === 0) setBulkPopupPosition(null);
                return newIds;
            } else {
                setBulkPopupPosition(zone.coordinates); // move popup to last clicked
                return [...prev, zone.id];
            }
        });
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        bulkApproveZones(selectedIds);
        message.success(`Successfully approved ${selectedIds.length} locations!`);
        setSelectedIds([]);
        setBulkPopupPosition(null);
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return;
        bulkRejectZones(selectedIds);
        message.success(`Successfully rejected ${selectedIds.length} locations!`);
        setSelectedIds([]);
        setBulkPopupPosition(null);
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
                <Col xs={24} lg={24}>
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
                    
                    {/* The Box selection logic component */}
                    <MapBoxSelector 
                        onAreaSelected={handleAreaSelected} 
                        onMapClick={handleMapClick}
                    />

                    {/* Bulk Selection Popup dynamically placed near the selected area */}
                    {selectedIds.length > 0 && bulkPopupPosition && (
                        <Popup 
                            position={bulkPopupPosition} 
                            autoPan={false}
                            closeButton={false}
                        >
                            <div style={{ textAlign: 'center', minWidth: 160 }}>
                                <Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
                                    {selectedIds.length} Location{selectedIds.length > 1 ? 's' : ''} Selected
                                </Title>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button 
                                        type="primary" 
                                        block
                                        icon={<CheckCircleOutlined />} 
                                        style={{ backgroundColor: '#52c41a' }}
                                        onClick={handleBulkApprove}
                                    >
                                        Approve All
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        danger 
                                        block
                                        icon={<CloseCircleOutlined />} 
                                        onClick={handleBulkReject}
                                    >
                                        Reject All
                                    </Button>
                                </Space>
                            </div>
                        </Popup>
                    )}
                    
                    {dangerZones.map(zone => {
                        const isPending = zone.status === 'pending';
                        const isSelected = selectedIds.includes(zone.id);
                        
                        // Dynamically render a selected icon checkmark if it's currently selected
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
                                            toggleMarkerSelection(zone);
                                        }
                                    }
                                }}
                            >
                                {/* Only show standard individual popup if it's NOT a pending item OR if NO items are actively selected */}
                                {(!isPending || selectedIds.length === 0) && (
                                    <Popup>
                                        <div style={{ minWidth: 200 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <h3 style={{ margin: 0, color: zone.severity === 'Critical' ? '#ff4d4f' : '#faad14', display: 'flex', alignItems: 'center' }}>
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
                                )}
                            </Marker>
                        );
                    })}
                </MapContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DangerZone;
