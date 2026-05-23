import api from './api';

export const helpRequestService = {
    getAllHelpRequests: async (params = { Page: 1, PageSize: 100 }) => {
        try {
            const response = await api.get('/helprequests', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching help requests:', error);
            throw error;
        }
    },
    createHelpRequest: async (data) => {
        try {
            const response = await api.post('/helprequests', data);
            return response.data;
        } catch (error) {
            console.error('Error creating help request:', error);
            throw error;
        }
    }
};

export default helpRequestService;
