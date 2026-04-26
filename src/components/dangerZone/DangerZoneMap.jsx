import React from 'react';
import { Card, Modal, Form, Input, Select, Button, Space } from 'antd';
const { Option } = Select;
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapBoxSelector from './MapBoxSelector';
import BulkActionPopup from './BulkActionPopup';
import ZoneMarker from './ZoneMarker';
import useDangerZoneMap from '../../hooks/useDangerZoneMap';

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
        approveZone,
        rejectZone,
        isAddPinModalOpen,
        setIsAddPinModalOpen,
        handleAddPinSubmit
    } = useDangerZoneMap();
    const [form] = Form.useForm();

    return (
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: 0, overflow: 'hidden' }}>
            <MapContainer 
                center={[7.8731, 80.7718]} 
                zoom={7} 
                style={{ height: '600px', width: '100%' }}
                minZoom={7}
                maxBounds={[
                    [5.8, 79.5],
                    [9.9, 82.0]
                ]}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapBoxSelector 
                    onAreaSelected={handleAreaSelected} 
                    onMapClick={handleMapClick}
                />

                <BulkActionPopup 
                    bulkPopupPosition={bulkPopupPosition}
                    selectedIds={selectedIds}
                    handleBulkApprove={handleBulkApprove}
                    handleBulkReject={handleBulkReject}
                />
                
                {dangerZones.map(zone => (
                    <ZoneMarker 
                        key={zone.id}
                        zone={zone}
                        isSelected={selectedIds.includes(zone.id)}
                        toggleMarkerSelection={toggleMarkerSelection}
                        approveZone={approveZone}
                        rejectZone={rejectZone}
                        hasBulkSelection={selectedIds.length > 0}
                    />
                ))}
            </MapContainer>

            <Modal
                title="Add New Danger Zone Pin"
                open={isAddPinModalOpen}
                onCancel={() => {
                    setIsAddPinModalOpen(false);
                }}
                footer={null}
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
                        <Input />
                    </Form.Item>
                    <Form.Item name="severity" label="Severity" initialValue="High">
                        <Select>
                            <Option value="High">High</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="Critical">Critical</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a brief description' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item>
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
