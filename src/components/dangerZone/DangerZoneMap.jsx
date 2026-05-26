import React, { useEffect } from 'react';
import { Card, Modal, Form, Input, Select, Button, Space, Radio, Tooltip } from 'antd';
const { Option } = Select;
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import { DragOutlined, SelectOutlined, WarningOutlined, PhoneOutlined, FileTextOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import MapBoxSelector from './MapBoxSelector';
import BulkActionPopup from './BulkActionPopup';
import ZoneMarker from './ZoneMarker';
import useDangerZoneMap from '../../hooks/useDangerZoneMap';

const USER_SVG = `<svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M858.5 763.6a374 374 0 0 0-707 0c-4.1 11.2-.2 23.5 9.7 30.5 48.9 34.6 109.9 55.4 175.7 58.7 6.1.3 11.9-2.2 15.6-7.1 27.5-36 70.8-59.7 119.7-59.7s92.2 23.7 119.7 59.7c3.7 4.9 9.5 7.4 15.6 7.1 65.8-3.3 126.8-24.1 175.7-58.7 10-7 13.9-19.3 9.7-30.5zM512 590c100.5 0 182-81.5 182-182s-81.5-182-182-182-182 81.5-182 182 81.5 182 182 182z"></path></svg>`;

const UserLocationIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="background-color: #722ed1; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px rgba(114,46,209,0.7); display: flex; align-items: center; justify-content: center; color: white;">${USER_SVG}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const ChangeMapView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 14);
        }
    }, [center, map]);
    return null;
};

const DangerZoneMap = () => {
    const {
        dangerZones,
        selectedIds,
        bulkPopupPosition,
        handleAreaSelected,
        handleMapClick,
        toggleMarkerSelection,
        handleBulkApprove,
        handleBulkReject,
        handleApproveZone,
        handleRejectZone,
        isAddPinModalOpen,
        setIsAddPinModalOpen,
        handleAddPinSubmit,
        selectionMode,
        setSelectionMode
    } = useDangerZoneMap();
    const [form] = Form.useForm();
    const location = useLocation();
    const redirectCenter = location.state?.center;
    const redirectName = location.state?.userName;

    return (
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: 0, overflow: 'hidden', position: 'relative' }}>
            {/* Map Interaction Controls */}
            <div style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                zIndex: 1000, 
                backgroundColor: 'white', 
                padding: '4px', 
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <Radio.Group 
                    value={selectionMode ? 'select' : 'pan'} 
                    onChange={(e) => setSelectionMode(e.target.value === 'select')}
                    optionType="button"
                    buttonStyle="solid"
                    size="middle"
                >
                    <Tooltip title="Pan Mode (Move Map)" placement="left">
                        <Radio.Button value="pan">
                            <DragOutlined />
                        </Radio.Button>
                    </Tooltip>
                    <Tooltip title="Select Mode (Drag to Select)" placement="left">
                        <Radio.Button value="select">
                            <SelectOutlined />
                        </Radio.Button>
                    </Tooltip>
                </Radio.Group>
            </div>

            <MapContainer 
                center={[7.8731, 80.7718]} 
                zoom={7} 
                style={{ height: '600px', width: '100%' }}
                minZoom={7}
                maxBounds={[
                    [5.0, 79.0],
                    [10.5, 82.5]
                ]}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <ChangeMapView center={redirectCenter} />

                {redirectCenter && (
                    <Marker position={redirectCenter} icon={UserLocationIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center', padding: '4px' }}>
                                <strong style={{ color: '#722ed1' }}>{redirectName ? `${redirectName}'s Location` : "User's Location"}</strong>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    Lat: {redirectCenter[0]}<br/>
                                    Lng: {redirectCenter[1]}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MapBoxSelector 
                    onAreaSelected={handleAreaSelected} 
                    onMapClick={handleMapClick}
                    selectionMode={selectionMode}
                />

                <BulkActionPopup 
                    bulkPopupPosition={bulkPopupPosition}
                    selectedIds={selectedIds}
                    dangerZones={dangerZones}
                    handleBulkApprove={handleBulkApprove}
                    handleBulkReject={handleBulkReject}
                />
                
                {dangerZones.map(zone => (
                    <ZoneMarker 
                        key={zone.id}
                        zone={zone}
                        isSelected={selectedIds.includes(zone.id)}
                        toggleMarkerSelection={toggleMarkerSelection}
                        approveZone={handleApproveZone}
                        rejectZone={handleRejectZone}
                        hasBulkSelection={selectedIds.length > 0}
                    />
                ))}
            </MapContainer>

            <Modal
                title={<span><WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />Add New Danger Zone Pin</span>}
                open={isAddPinModalOpen}
                onCancel={() => {
                    setIsAddPinModalOpen(false);
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        handleAddPinSubmit(values);
                        form.resetFields();
                    }}
                >
                    <Form.Item name="name" label="Zone Name" rules={[{ required: true, message: 'Please enter zone name' }]}>
                        <Input placeholder="e.g., Nugegoda Flash Flood" />
                    </Form.Item>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="type" label="Danger Type" initialValue="Flood" style={{ flex: 1 }}>
                            <Select>
                                <Option value="Flood">Flood</Option>
                                <Option value="Landslide">Landslide</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="severity" label="Severity" initialValue="High" style={{ flex: 1 }}>
                            <Select>
                                <Option value="Low">Low</Option>
                                <Option value="Medium">Medium</Option>
                                <Option value="High">High</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true, message: 'Please enter a contact number' }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="e.g., 0771234567" />
                    </Form.Item>

                    <Form.Item name="additionalNote" label="Additional Note" rules={[{ required: true, message: 'Please enter additional notes' }]}>
                        <Input.TextArea rows={4} placeholder="Describe the situation..." prefix={<FileTextOutlined />} />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsAddPinModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Add Pin</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default DangerZoneMap;
