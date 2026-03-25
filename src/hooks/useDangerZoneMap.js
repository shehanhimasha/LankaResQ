import { useState } from 'react';
import { message } from 'antd';
import L from 'leaflet';
import { useDangerZone } from '../context/DangerZoneContext';

const useDangerZoneMap = () => {
    const { dangerZones, approveZone, rejectZone, bulkApproveZones, bulkRejectZones } = useDangerZone();
    
    // State for interactive map selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkPopupPosition, setBulkPopupPosition] = useState(null);

    const pendingZones = dangerZones.filter(z => z.status === 'pending');

    const handleAreaSelected = (bounds) => {
        const newlySelectedIds = [];
        pendingZones.forEach(zone => {
            const point = L.latLng(zone.coordinates[0], zone.coordinates[1]);
            if (bounds.contains(point)) {
                newlySelectedIds.push(zone.id);
            }
        });

        if (newlySelectedIds.length > 0) {
            setSelectedIds(prev => Array.from(new Set([...prev, ...newlySelectedIds])));
            setBulkPopupPosition(bounds.getNorthEast());
            message.success(`Selected ${newlySelectedIds.length} locations within the area.`);
        }
    };

    const handleMapClick = () => {
        setSelectedIds([]);
        setBulkPopupPosition(null);
    };

    const toggleMarkerSelection = (zone) => {
        setSelectedIds(prev => {
            if (prev.includes(zone.id)) {
                const newIds = prev.filter(selectedId => selectedId !== zone.id);
                if (newIds.length === 0) setBulkPopupPosition(null);
                return newIds;
            } else {
                setBulkPopupPosition(zone.coordinates); 
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

    return {
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
    };
};

export default useDangerZoneMap;
