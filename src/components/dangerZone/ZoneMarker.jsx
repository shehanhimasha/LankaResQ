import React, { useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Tag, Space, Button, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined, WarningOutlined, DeleteOutlined } from '@ant-design/icons';
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

// SVG for Checkmark (Matches CheckOutlined)
const CHECK_SVG = `<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path></svg>`;

// SVG for Question Mark (Matches QuestionOutlined)
const QUESTION_SVG = `<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M512 682c-20.9 0-38 17.1-38 38s17.1 38 38 38 38-17.1 38-38-17.1-38-38-38zm0-466c-94.4 0-171 76.6-171 171 0 17.7 14.3 32 32 32s32-14.3 32-32c0-59.1 47.9-107 107-107s107 47.9 107 107c0 43.1-23.7 82.2-61.9 102.1-15.5 8.1-25.1 24.2-25.1 41.9v36c0 17.7 14.3 32 32 32s32-14.3 32-32v-11.4c52.4-19.1 87-69.3 87-128.6 0-94.4-76.6-171-171-171z"></path></svg>`;

// Approved marker — green circle with SVG checkmark
const ApprovedIcon = L.divIcon({
    className: 'custom-approved-marker',
    html: `<div style="background-color: #52c41a; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(82,196,26,0.5); display: flex; align-items: center; justify-content: center; color: white;">${CHECK_SVG}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

// Pending marker — orange pulsing circle with SVG question mark
const PendingIcon = L.divIcon({
    className: 'custom-pending-marker',
    html: `<div style="background-color: #fa8c16; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(250,140,22,0.5); display: flex; align-items: center; justify-content: center; color: white; animation: pulse-pending 1.5s ease-in-out infinite;">${QUESTION_SVG}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

// Selected marker — blue circle with SVG checkmark
const SelectedIcon = L.divIcon({
    className: 'custom-selected-marker',
    html: `<div style="background-color: #1890ff; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px rgba(24,144,255,0.7); display: flex; align-items: center; justify-content: center; color: white;">${CHECK_SVG}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const getMarkerIcon = (zone, isSelected) => {
    if (isSelected) return SelectedIcon;
    if (zone.status === 'approved') return ApprovedIcon;
    if (zone.status === 'pending') return PendingIcon;
    return DefaultIcon;
};

const ZoneMarker = ({ zone, isSelected, toggleMarkerSelection, approveZone, rejectZone }) => {
    const isPending = zone.status === 'pending';
    const isApproved = zone.status === 'approved';
    const markerRef = useRef(null);

    const markerIcon = getMarkerIcon(zone, isSelected);

    return (
        <Marker 
            ref={markerRef}
            position={zone.coordinates}
            icon={markerIcon}
            eventHandlers={{
                click: (e) => {
                    // Shift+click toggles bulk selection
                    if (e.originalEvent.shiftKey && isPending) {
                        toggleMarkerSelection(zone);
                        // Close popup when in selection mode
                        if (markerRef.current) {
                            markerRef.current.closePopup();
                        }
                    }
                }
            }}
        >
            <Popup autoPanPadding={[50, 50]} offset={[0, -10]}>
                <div style={{ minWidth: 260 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h3 style={{ margin: 0, color: zone.severity === 'High' ? '#ff4d4f' : '#faad14', display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                            {zone.name}
                        </h3>
                        {isPending && <Tag color="orange">Pending</Tag>}
                        {isApproved && <Tag color="green">Approved</Tag>}
                    </div>
                    
                    <div style={{ marginBottom: 12 }}>
                        <Tag icon={<WarningOutlined />} color={zone.type === 'Flood' ? 'blue' : zone.type === 'Landslide' ? 'orange' : 'default'} style={{ marginBottom: 4 }}>
                            {zone.type || 'Unknown Type'}
                        </Tag>
                        <Tag color={zone.severity === 'High' ? 'red' : zone.severity === 'Medium' ? 'orange' : 'blue'}>{zone.severity} Severity</Tag>
                    </div>

                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}>
                        <strong>Additional Note:</strong><br />
                        {zone.additionalNote || 'No additional notes provided.'}
                    </p>

                    <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                        <PhoneOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                        <strong>Contact:</strong> {zone.contactNumber || 'Not available'}
                    </p>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        {isPending ? (
                            <>
                                <Button 
                                    type="primary" 
                                    size="middle" 
                                    icon={<CheckCircleOutlined />}
                                    style={{ backgroundColor: '#52c41a', border: 'none' }}
                                    onClick={() => approveZone(zone.id)}
                                >
                                    Approve
                                </Button>
                                <Button 
                                    type="primary" 
                                    danger 
                                    size="middle" 
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => rejectZone(zone.id)}
                                >
                                    Reject
                                </Button>
                            </>
                        ) : isApproved ? (
                            <Button 
                                type="primary" 
                                danger 
                                size="middle" 
                                block
                                icon={<DeleteOutlined />}
                                onClick={() => rejectZone(zone.id)}
                            >
                                Delete
                            </Button>
                        ) : null}
                    </Space>
                </div>
            </Popup>
        </Marker>
    );
};

export default ZoneMarker;
