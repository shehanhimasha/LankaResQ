import api from './api';

const ROAD_CLOSURES_PATH = '/api/road-closures';

const normalizeRoadClosure = (item) => {
    if (!item) return item;

    return {
        id: item.id ?? item.Id,
        roadName: item.roadName ?? item.RoadName,
        reason: item.reason ?? item.Reason,
        status: item.status ?? item.Status,
        geometryGeoJson: item.geometryGeoJson ?? item.GeometryGeoJson,
        blockedAt: item.blockedAt ?? item.BlockedAt,
        clearedAt: item.clearedAt ?? item.ClearedAt,
        createdBy: item.createdBy ?? item.CreatedBy,
    };
};

const normalizeList = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(normalizeRoadClosure);
};

const roadClosureService = {
    getAll: async () => {
        const response = await api.get(ROAD_CLOSURES_PATH);
        return normalizeList(response.data);
    },

    create: async (data) => {
        const response = await api.post(ROAD_CLOSURES_PATH, data);
        return normalizeRoadClosure(response.data);
    },

    bulkCreate: async (data) => {
        const response = await api.post(`${ROAD_CLOSURES_PATH}/bulk`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${ROAD_CLOSURES_PATH}/${id}`);
        return response.data;
    },

    bulkDelete: async (ids) => {
        const response = await api.delete(`${ROAD_CLOSURES_PATH}/bulk`, { data: { ids } });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`${ROAD_CLOSURES_PATH}/${id}/status`, { status });
        return response.data;
    }
};

export default roadClosureService;