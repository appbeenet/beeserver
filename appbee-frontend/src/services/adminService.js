import api from '../api/axios';

// --- USERS ---
export const getPendingUsers = async () => {
    const response = await api.get('/admin/users/pending');
    return response.data;
};

export const approveUser = async (id) => {
    const response = await api.post(`/admin/users/${id}/approve`);
    return response.data;
};

export const rejectUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}/reject`);
    return response.data;
};

// --- COMPANIES ---
export const getAllCompanies = async () => {
    const response = await api.get('/admin/companies');
    return response.data;
};

export const createCompany = async (data) => {
    const response = await api.post('/admin/companies', data);
    return response.data;
};

export const updateCompany = async (id, data) => {
    const response = await api.put(`/admin/companies/${id}`, data);
    return response.data;
};

export const deleteCompany = async (id) => {
    const response = await api.delete(`/admin/companies/${id}`);
    return response.data;
};
