import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ZoneMarker = ({ zone, isSelected, toggleMarkerSelection, approveZone, rejectZone, hasBulkSelection }) => {
    const isPending = zone.status === 'pending';
    
    const markerIcon = isSelected ? L.divIcon({
        className: 'custom-selected-marker',
        html: `<div style="background-color: #52c41a; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">✓</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    }) : DefaultIcon;

    return (
        <Marker 
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
            {(!isPending || !hasBulkSelection) && (
                <Popup>
                    <div style={{ minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ margin: 0, color: zone.severity === 'Critical' ? '#ff4d4f' : '#faad14', display: 'flex', alignItems: 'center' }}>
                                {zone.name}
                            </h3>
                            {isPending && <Tag color="orange">Pending</Tag>}
                            {zone.status === 'approved' && <Tag color="green">Approved</Tag>}
                            {zone.status === 'rejected' && <Tag color="red">Rejected</Tag>}
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
};

export default ZoneMarker;
