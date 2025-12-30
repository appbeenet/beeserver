import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:8080/api/tasks';

// Yardımcı: Token Header
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

// 1. Tüm görevleri getir
export const getAllTasks = async () => {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
};

// 2. Yeni görev oluştur
export const createTask = async (taskData) => {
    const response = await axios.post(API_URL, taskData, getAuthConfig());
    return response.data;
};

// 3. (DÜZELTİLDİ) TasksPage.jsx hatası vermemesi için bu ismi koruyoruz.
// AMA mantığını değiştirdik: Artık görevi "Submit" etmiyor, sadece "Claim" ediyor.
export const startTaskProcess = async (taskId) => {
    // BURASI ÇOK ÖNEMLİ: /submit yerine /claim kullanıyoruz.
    // Böylece görev "Tamamlandı" olmuyor, sadece "Alındı" oluyor.
    const response = await axios.post(`${API_URL}/${taskId}/claim`, {}, getAuthConfig());
    return response.data;
};

// 4. Görevi Üzerine Al (Modal İçin)
export const claimTask = async (taskId) => {
    const response = await axios.post(`${API_URL}/${taskId}/claim`, {}, getAuthConfig());
    return response.data;
};

// 5. Görevi Teslim Et (Git Linki ile Final Submit)
export const submitTask = async (taskId, submissionData) => {
    // submissionData: { notes: "...", attachmentUrl: "..." }
    const response = await axios.post(`${API_URL}/${taskId}/submit`, submissionData, getAuthConfig());
    return response.data;
};

// 6. Tek bir görevin detayını getir
export const getTaskById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

// 7. YENİ: Bir göreve yapılan tüm başvuruları (çözümleri) getir
export const getTaskSubmissions = async (taskId) => {
    // Backend'de az önce eklediğimiz endpoint'e istek atıyor
    const response = await axios.get(`${API_URL}/${taskId}/submissions`, getAuthConfig());
    return response.data;
};

// 8. YENİ: Başvuruyu Onayla veya Reddet (Opsiyonel)
export const evaluateSubmission = async (submissionId, status) => {
    const response = await axios.put(`${API_URL}/submissions/${submissionId}?status=${status}`, {}, getAuthConfig());
    return response.data;
};

// 9. DÜZELTİLEN KISIM: Görevi Onayla
// HATA BURADAYDI: axiosInstance yerine normal axios kullanmalısın
export const approveTask = async (taskId) => {
    // axiosInstance.post(...) YANLIŞTI.
    // Doğrusu:
    const response = await axios.post(`${API_URL}/${taskId}/approve`, {}, getAuthConfig());
    return response.data;
};
