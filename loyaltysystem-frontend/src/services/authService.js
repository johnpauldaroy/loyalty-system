import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('token');
        }
    },

    getCurrentUser: async () => {
        const response = await api.post('/auth/me');
        return response.data.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data.data;
    }
};

export default authService;
