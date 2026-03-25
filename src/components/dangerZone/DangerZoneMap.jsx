import React from 'react';
import { Card } from 'antd';
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
        rejectZone
    } = useDangerZoneMap();

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
        </Card>
    );
};

export default DangerZoneMap;
