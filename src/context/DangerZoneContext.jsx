import React, { createContext, useState, useContext, useEffect } from 'react';
import dangerZoneService from '../services/dangerZoneService';

const DangerZoneContext = createContext(null);

export const DangerZoneProvider = ({ children }) => {
    const [dangerZones, setDangerZones] = useState([]);

    const fetchDangerZones = async () => {
        try {
            const data = await dangerZoneService.getAllDangerZones({ Page: 1, PageSize: 100 });
            if (data && data.items) {
                const mappedZones = data.items.map(item => {
                    let coords = [0, 0];
                    if (item.location) {
                        const parts = item.location.split(',');
                        if (parts.length === 2) {
                            coords = [parseFloat(parts[0].trim()), parseFloat(parts[1].trim())];
                        }
                    }
                    
                    return {
                        id: item.id,
                        name: item.name || 'Unnamed Zone',
                        coordinates: coords,
                        severity: 'High',
                        type: 'Flood',
                        status: 'approved',
                        contactNumber: 'N/A',
                        additionalNote: 'Fetched from backend.'
                    };
                });
                setDangerZones(mappedZones);
            }
        } catch (error) {
            console.error("Failed to fetch danger zones:", error);
        }
    };

    useEffect(() => {
        fetchDangerZones();
    }, []);

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
