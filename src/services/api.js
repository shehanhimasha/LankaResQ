import axios from 'axios';

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        'https://disastermgtpro.runasp.net',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        try {
            const stored = localStorage.getItem('user');

            if (stored) {
                const user = JSON.parse(stored);

                const token =
                    user.token ||
                    user.accessToken ||
                    localStorage.getItem('authToken');

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } else {
                const token = localStorage.getItem('authToken');

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (e) {}

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;