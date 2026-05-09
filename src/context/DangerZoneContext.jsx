import React, { createContext, useState, useContext } from 'react';

const DangerZoneContext = createContext(null);

export const DangerZoneProvider = ({ children }) => {
    // Mock Danger Zones data with 'status'
    // Status can be: 'approved', 'pending' (from user), 'rejected'
    const [dangerZones, setDangerZones] = useState([
        { id: 1, name: 'Flood Warning Area', coordinates: [6.9271, 79.8612], severity: 'High', type: 'Flood', additionalNote: 'Severe flooding reported in Colombo.', contactNumber: '0112345678', status: 'approved' },
        { id: 2, name: 'Landslide Risk', coordinates: [7.2906, 80.6337], severity: 'High', type: 'Landslide', additionalNote: 'High risk of landslides in Kandy area.', contactNumber: '0812345678', status: 'approved' },
        { id: 3, name: 'River Overflow', coordinates: [6.0328, 80.2168], severity: 'Medium', type: 'Flood', additionalNote: 'River banks overflowing in Galle.', contactNumber: '0912345678', status: 'approved' },
        // Mock pending zones from app users
        { id: 4, name: 'User Report: Flooded Road', coordinates: [6.8654, 79.8601], severity: 'High', type: 'Flood', additionalNote: 'Reported by user. Road completely underwater near Nugegoda.', contactNumber: '0771234567', status: 'pending' },
        { id: 5, name: 'User Report: Landslide Blockage', coordinates: [7.2800, 80.6400], severity: 'Medium', type: 'Landslide', additionalNote: 'Reported by user. Landslide blocking access road.', contactNumber: '0719876543', status: 'pending' },
        { id: 6, name: 'User Report: Minor Earth Slip', coordinates: [6.6828, 80.3992], severity: 'High', type: 'Landslide', additionalNote: 'Reported by user. Minor earth slip blocking the main road near Ratnapura.', contactNumber: '0754567890', status: 'pending'},
        { id: 7, name: 'User Report: Bridge Damaged', coordinates: [6.0535, 80.2210], severity: 'High', type: 'Flood', additionalNote: 'Reported by user. Bridge washed away due to flash floods near Galle.', contactNumber: '0723456789', status: 'pending'},
        { id: 8, name: 'User Report: Heavy Rain Flood', coordinates: [7.9403, 81.0000], severity: 'Medium', type: 'Flood', additionalNote: 'Heavy rain causing localized flooding in Polonnaruwa.', contactNumber: '0706543210', status: 'pending'},
        { id: 9, name: 'User Report: Road Slip', coordinates: [6.9500, 79.9000], severity: 'High', type: 'Landslide', additionalNote: 'Part of the road has slipped into the valley in Kelaniya.', contactNumber: '0787654321', status: 'pending'},
        { id: 10, name: 'User Report: Rock Fall', coordinates: [6.9667, 80.7833], severity: 'High', type: 'Landslide', additionalNote: 'Reported by user. Large rocks have fallen onto the railway track in Nuwara Eliya.', contactNumber: '0761112223', status: 'pending'},
        { id: 11, name: 'User Report: Heavy Water Logging', coordinates: [6.9270, 79.8612], severity: 'Medium', type: 'Flood', additionalNote: 'Reported by user. Colombo 07 roads are heavily waterlogged.', contactNumber: '0743334445', status: 'pending'}
    ]);

    const approveZone = (id) => {
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'approved' } : z));
    };

    const rejectZone = (id) => {
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'rejected' } : z));
    };

    const bulkApproveZones = (ids) => {
        setDangerZones(zones => zones.map(z => ids.includes(z.id) ? { ...z, status: 'approved' } : z));
    };

    const bulkRejectZones = (ids) => {
        setDangerZones(zones => zones.map(z => ids.includes(z.id) ? { ...z, status: 'rejected' } : z));
    };

    const addZone = (newZone) => {
        setDangerZones([...dangerZones, { ...newZone, id: dangerZones.length ? Math.max(...dangerZones.map(z => z.id)) + 1 : 1 }]);
    };

    const activeZones = dangerZones.filter(z => z.status === 'approved' || z.status === 'pending');

    return (
        <DangerZoneContext.Provider value={{ dangerZones: activeZones, addZone, approveZone, rejectZone, bulkApproveZones, bulkRejectZones }}>
            {children}
        </DangerZoneContext.Provider>
    );
};

export const useDangerZone = () => useContext(DangerZoneContext);
