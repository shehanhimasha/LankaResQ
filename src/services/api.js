import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://disastermgtpro.runasp.net',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Attach Authorization header if token is available in localStorage
api.interceptors.request.use((config) => {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            const user = JSON.parse(stored);
            const token = user.token || user.accessToken || localStorage.getItem('authToken');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
    } catch (e) {
        // ignore
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
