import api from './api';

export const createShelter = async (shelterData) => {
    try {
        const response = await api.post('/shelters', shelterData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getShelters = async (params = {}) => {
    try {
        const { Query, Page = 1, PageSize = 10 } = params;
        const response = await api.get('/shelters', {
            params: {
                Query,
                Page,
                PageSize
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateShelter = async (id, shelterData) => {
    try {
        const response = await api.put(`/shelters/${id}`, shelterData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteShelter = async (id) => {
    try {
        const response = await api.delete(`/shelters/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
