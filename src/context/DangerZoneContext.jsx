import React, { createContext, useState, useContext } from 'react';

const DangerZoneContext = createContext(null);

export const DangerZoneProvider = ({ children }) => {
    // Mock Danger Zones data with 'status'
    // Status can be: 'approved', 'pending' (from user), 'rejected'
    const [dangerZones, setDangerZones] = useState([
        { id: 1, name: 'Flood Warning Area', coordinates: [6.9271, 79.8612], severity: 'High', description: 'Severe flooding reported in Colombo.', status: 'approved' },
        { id: 2, name: 'Landslide Risk', coordinates: [7.2906, 80.6337], severity: 'Critical', description: 'High risk of landslides in Kandy area.', status: 'approved' },
        { id: 3, name: 'Storm Surge', coordinates: [6.0328, 80.2168], severity: 'Medium', description: 'Coastal storm warnings in Galle.', status: 'approved' },
        // Mock pending zones from app users
        { id: 4, name: 'User Report: Flooded Road', coordinates: [6.8654, 79.8601], severity: 'High', description: 'Reported by user. Road completely underwater near Nugegoda.', status: 'pending' },
        { id: 5, name: 'User Report: Fallen Tree', coordinates: [7.2800, 80.6400], severity: 'Medium', description: 'Reported by user. Tree struck power lines.', status: 'pending' },
        { id: 6, name: 'User Report: Minor Earth Slip', coordinates: [6.6828, 80.3992], severity: 'High', description: 'Reported by user. Minor earth slip blocking the main road near Ratnapura.', status: 'pending'},
        { id: 7, name: 'User Report: Bridge Damaged', coordinates: [6.0535, 80.2210], severity: 'Critical', description: 'Reported by user. Bridge washed away due to flash floods near Galle.', status: 'pending'},
        { id: 8, name: 'User Report: Wild Elephant Sightings', coordinates: [7.9403, 81.0000], severity: 'Medium', description: 'Reported by user. Herd of wild elephants near the main highway close to Polonnaruwa.', status: 'pending'},
        { id: 9, name: 'User Report: Chemical Spill', coordinates: [6.9500, 79.9000], severity: 'Critical', description: 'Reported by user. Industrial accident, factory leaking unknown chemicals in Kelaniya.', status: 'pending'},
        { id: 10, name: 'User Report: Rock Fall', coordinates: [6.9667, 80.7833], severity: 'Critical', description: 'Reported by user. Large rocks have fallen onto the railway track in Nuwara Eliya.', status: 'pending'},
        { id: 11, name: 'User Report: Heavy Traffic & Water Logging', coordinates: [6.9270, 79.8612], severity: 'Medium', description: 'Reported by user. Colombo 07 roads are heavily waterlogged causing severe traffic.', status: 'pending'}
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

    const activeZones = dangerZones.filter(z => z.status === 'approved' || z.status === 'pending');

    return (
        <DangerZoneContext.Provider value={{ dangerZones: activeZones, approveZone, rejectZone, bulkApproveZones, bulkRejectZones }}>
            {children}
        </DangerZoneContext.Provider>
    );
};

export const useDangerZone = () => useContext(DangerZoneContext);
