import api from './api';

export const createShelter = async (shelterData) => {
    try {
        const response = await api.post('/shelters', shelterData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getShelters = async (page = 1, pageSize = 100) => {
    try {
        const response = await api.get('/shelters', {
            params: {
                Page: page,
                PageSize: pageSize
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
