import api from './api';

export const dangerZoneService = {
    getAllDangerZones: async (params = { Page: 1, PageSize: 100 }) => {
        try {
            const response = await api.get('/danger-zones', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching danger zones:', error);
            throw error;
        }
    },
    createDangerZone: async (data) => {
        try {
            const response = await api.post('/danger-zones', data);
            return response.data;
        } catch (error) {
            console.error('Error creating danger zone:', error);
            throw error;
        }
    },
    updateDangerZone: async (id, data) => {
        try {
            const response = await api.put(`/danger-zones/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating danger zone ${id}:`, error);
            throw error;
        }
    }
};

export default dangerZoneService;
