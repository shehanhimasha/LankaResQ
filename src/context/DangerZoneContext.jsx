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
        { id: 5, name: 'User Report: Fallen Tree', coordinates: [7.2800, 80.6400], severity: 'Medium', description: 'Reported by user. Tree struck power lines.', status: 'pending' }
    ]);

    const approveZone = (id) => {
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'approved' } : z));
    };

    const rejectZone = (id) => {
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'rejected' } : z));
    };

    const activeZones = dangerZones.filter(z => z.status === 'approved' || z.status === 'pending');

    return (
        <DangerZoneContext.Provider value={{ dangerZones: activeZones, approveZone, rejectZone }}>
            {children}
        </DangerZoneContext.Provider>
    );
};

export const useDangerZone = () => useContext(DangerZoneContext);
