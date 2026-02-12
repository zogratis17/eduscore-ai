import api from './api';

export const analyticsService = {
    getDashboardStats: async () => {
        const response = await api.get('/analytics/dashboard-stats');
        return response.data;
    },

    getTrends: async () => {
        // Placeholder for future implementation
        // const response = await api.get('/analytics/trends');
        // return response.data;
        return [];
    }
};
