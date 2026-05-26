import { useState, useRef, useCallback } from 'react';
import React from 'react';
import { notification, Modal } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import L from 'leaflet';
import { useDangerZone } from '../context/DangerZoneContext';

// Configure notifications to show in top right
notification.config({
    placement: 'topRight',
    duration: 3,
});

const useDangerZoneMap = () => {
    const { dangerZones, addZone, approveZone, rejectZone, bulkApproveZones, bulkRejectZones } = useDangerZone();

    // State for interactive map selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkPopupPosition, setBulkPopupPosition] = useState(null);
    const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
    const [clickedLocation, setClickedLocation] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false); // Toggle between Pan and Select
    const markerClickedRef = useRef(false);

    const pendingZones = dangerZones.filter(z => z.status === 'pending');

    const handleAreaSelected = (bounds) => {
        const newlySelectedIds = [];
        // Only select pending zones in selection mode
        pendingZones.forEach(zone => {
            const point = L.latLng(zone.coordinates[0], zone.coordinates[1]);
            if (bounds.contains(point)) {
                newlySelectedIds.push(zone.id);
            }
        });

        if (newlySelectedIds.length > 0) {
            setSelectedIds(prev => Array.from(new Set([...prev, ...newlySelectedIds])));
            setBulkPopupPosition(bounds.getNorthEast());
            notification.info({
                message: 'Area Selected',
                description: `Selected ${newlySelectedIds.length} pending reports within the area.`,
                icon: React.createElement(CheckCircleOutlined, { style: { color: '#1890ff' } }),
            });
        }
    };

    const handleMapClick = (latlng) => {
        // If we are in selection mode and just finished a drag, don't trigger click
        if (selectionMode) return;

        setSelectedIds([]);
        setBulkPopupPosition(null);
        // Don't show add-pin modal if a marker was just clicked
        if (markerClickedRef.current) {
            markerClickedRef.current = false;
            return;
        }
        if (latlng) {
            const { lat, lng } = latlng;
            // Bounding box for Sri Lanka ground area
            if (lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 82.0) {
                setClickedLocation(latlng);
                setIsAddPinModalOpen(true);
            }
        }
    };

    const handleMarkerClicked = useCallback(() => {
        markerClickedRef.current = true;
    }, []);

    const handleApproveZone = useCallback((id) => {
        markerClickedRef.current = true;
        approveZone(id);
        notification.success({
            message: 'Zone Approved',
            description: 'The danger zone has been successfully approved and is now active.',
            placement: 'topRight'
        });
    }, [approveZone]);

    const handleRejectZone = useCallback((id) => {
        markerClickedRef.current = true;
        const zone = dangerZones.find(z => z.id === id);
        const zoneName = zone ? zone.name : 'this zone';

        Modal.confirm({
            title: 'Delete Danger Zone Report',
            icon: React.createElement(DeleteOutlined, { style: { color: '#ff4d4f' } }),
            content: React.createElement('div', null,
                React.createElement('p', null, 'Are you sure you want to permanently ', React.createElement('strong', null, 'delete'), ' this report?'),
                React.createElement('p', { style: { marginTop: 8 } }, React.createElement('strong', null, zoneName)),
                React.createElement('p', { style: { color: '#888', fontSize: 13, marginTop: 8 } }, 'This action cannot be undone and the marker will be completely removed from the live map view.')
            ),
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                rejectZone(id);
                notification.error({
                    message: 'Report Deleted',
                    description: 'The danger zone report has been successfully removed from the system.',
                    icon: React.createElement(DeleteOutlined, { style: { color: '#ff4d4f' } }),
                    placement: 'topRight'
                });
            },
        });
    }, [rejectZone, dangerZones]);

    const handleAddPinSubmit = (values) => {
        addZone({
            name: values.name,
            severity: values.severity,
            type: values.type,
            additionalNote: values.additionalNote,
            contactNumber: values.contactNumber,
            coordinates: [clickedLocation.lat, clickedLocation.lng],
            status: 'pending' // CHANGED: Now shows as pending first
        });
        notification.info({
            message: 'Pin Added (Pending)',
            description: 'New danger zone pin has been added as a pending report. You can approve or delete it from the map.',
            placement: 'topRight'
        });
        setIsAddPinModalOpen(false);
        setClickedLocation(null);
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
        // Only approve the ones that are actually pending
        const idsToApprove = dangerZones
            .filter(z => selectedIds.includes(z.id) && z.status === 'pending')
            .map(z => z.id);

        if (idsToApprove.length === 0) return;

        bulkApproveZones(idsToApprove);
        notification.success({
            message: 'Bulk Approval Successful',
            description: `Successfully approved ${idsToApprove.length} pending reports!`,
            placement: 'topRight'
        });
        setSelectedIds([]);
        setBulkPopupPosition(null);
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return;
        const count = selectedIds.length;
        Modal.confirm({
            title: 'Bulk Delete Reports',
            icon: React.createElement(DeleteOutlined, { style: { color: '#ff4d4f' } }),
            content: React.createElement('div', null,
                React.createElement('p', null, 'Are you sure you want to permanently ', React.createElement('strong', null, 'delete'), ` these ${count} selected reports?`),
                React.createElement('p', { style: { color: '#888', fontSize: 13, marginTop: 8 } }, 'All selected markers will be completely removed from the system and the live map view.')
            ),
            okText: 'Yes, Delete All',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                bulkRejectZones(selectedIds);
                notification.error({
                    message: 'Reports Deleted',
                    description: `Successfully removed ${count} danger zone reports.`,
                    icon: React.createElement(DeleteOutlined, { style: { color: '#ff4d4f' } }),
                    placement: 'topRight'
                });
                setSelectedIds([]);
                setBulkPopupPosition(null);
            },
        });
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
        handleApproveZone,
        handleRejectZone,
        handleMarkerClicked,
        isAddPinModalOpen,
        setIsAddPinModalOpen,
        clickedLocation,
        handleAddPinSubmit,
        selectionMode,
        setSelectionMode
    };
};

export default useDangerZoneMap;
