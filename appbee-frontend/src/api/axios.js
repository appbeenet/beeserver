import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Backend portunla eşleşmeli
});

// REQUEST INTERCEPTOR: Her istekten önce çalışır
api.interceptors.request.use(
    (config) => {
        // Token'ı localStorage'dan al (Login sırasında buraya kaydetmiştik)
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAllTasks = async () => {
    // Artık header eklemene gerek yok, interceptor hallediyor
    const response = await api.get('/tasks');
    return response.data;
};

// Diğer metodlar...
export const getTaskById = async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

export default api;