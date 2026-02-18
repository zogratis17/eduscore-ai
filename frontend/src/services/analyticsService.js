import api from './api';

export const analyticsService = {
    getDashboardStats: async () => {
        const response = await api.get('/analytics/dashboard-stats');
        return response.data;
    },

    getGradeDistribution: async () => {
        const response = await api.get('/analytics/grade-distribution');
        return response.data;
    },
};
