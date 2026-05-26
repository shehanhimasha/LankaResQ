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

                    // Map approvalStage.id to status string
                    let status = 'pending';
                    if (item.approvalStage) {
                        if (item.approvalStage.id === 1) status = 'pending';
                        if (item.approvalStage.id === 2) status = 'rejected';
                        if (item.approvalStage.id === 3) status = 'approved';
                    } else if (item.activeStatusId !== undefined && item.activeStatusId !== 1) {
                        // fallback depending on data if needed
                    }

                    return {
                        id: item.id,
                        name: item.name || 'Unnamed Zone',
                        coordinates: coords,
                        severity: item.serverity?.name || item.severity || 'High',
                        type: item.dangerType?.name || item.type || 'Flood',
                        status: status,
                        contactNumber: item.contactNumber || 'N/A',
                        additionalNote: item.note || item.additionalNote || 'Fetched from backend.',
                        rawDangerTypeId: item.dangerTypeId || 0,
                        rawSeverityId: item.serverityId || 0
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

    const approveZone = async (id) => {
        try {
            await dangerZoneService.updateDangerZone(id, { approvalStageId: 3 });
        } catch (e) {
            console.warn("Could not update. Proceeding with UI update.", e);
        }
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'approved' } : z));
    };

    const rejectZone = async (id) => {
        try {
            await dangerZoneService.updateDangerZone(id, { approvalStageId: 2 });
        } catch (e) {
            console.warn("Could not update. Proceeding with UI update.", e);
        }
        setDangerZones(zones => zones.map(z => z.id === id ? { ...z, status: 'rejected' } : z));
    };

    const bulkApproveZones = async (ids) => {
        setDangerZones(zones => zones.map(z => ids.includes(z.id) ? { ...z, status: 'approved' } : z));
        try {
            await Promise.all(ids.map(id => dangerZoneService.updateDangerZone(id, { approvalStageId: 3 })));
        } catch (e) { console.error(e); }
    };

    const bulkRejectZones = async (ids) => {
        setDangerZones(zones => zones.map(z => ids.includes(z.id) ? { ...z, status: 'rejected' } : z));
        try {
            await Promise.all(ids.map(id => dangerZoneService.updateDangerZone(id, { approvalStageId: 2 })));
        } catch (e) { console.error(e); }
    };

    const addZone = async (newZone) => {
        // Optimistically add to UI
        const tempId = dangerZones.length ? Math.max(...dangerZones.map(z => z.id)) + 1 : 1;
        setDangerZones([...dangerZones, { ...newZone, id: tempId }]);

        try {
            // Map types appropriately depending on your static mappings
            const typeMapping = { "Flood": 1, "Landslide": 2 };
            const severityMapping = { "Low": 1, "Medium": 2, "High": 3 };

            await dangerZoneService.createDangerZone({
                name: newZone.name,
                location: `${newZone.coordinates[0]},${newZone.coordinates[1]}`,
                dangerTypeId: typeMapping[newZone.type] || 1,
                serverityId: severityMapping[newZone.severity] || 3, // based on API schema naming: serverityId
                note: newZone.additionalNote,
                contactNumber: newZone.contactNumber
            });
            // Re-fetch to reconcile with DB if needed
            fetchDangerZones();
        } catch (e) {
            console.error("Failed to add danger zone to database:", e);
        }
    };

    const activeZones = dangerZones.filter(z => z.status === 'approved' || z.status === 'pending');

    return (
        <DangerZoneContext.Provider value={{ dangerZones: activeZones, addZone, approveZone, rejectZone, bulkApproveZones, bulkRejectZones }}>
            {children}
        </DangerZoneContext.Provider>
    );
};

export const useDangerZone = () => useContext(DangerZoneContext);
