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
    }
};

export default dangerZoneService;
