import axios from '../api/axios';

// 1. Tüm görevleri getir
export const getAllTasks = async () => {
    const response = await axios.get('/tasks');
    return response.data;
};

// 2. Yeni görev oluştur (Company)
export const createTask = async (taskData) => {
    const response = await axios.post('/tasks', taskData);
    return response.data;
};

// 3. YENİ: Görev Sürecini Başlat (Görevi Kilitlemeden Al)
// Bu fonksiyon, 'claim' yerine 'submit' endpoint'ini kullanarak
// görevin statüsünü değiştirmeden (PUBLISHED kalarak) kullanıcının
// görev üzerinde çalışmaya başladığını kaydeder.
export const startTaskProcess = async (taskId) => {
    // Backend'e boş bir başlangıç 'submission'ı gönderiyoruz.
    const initialData = {
        notes: "Görev süreci başlatıldı.",
        attachmentUrl: ""
    };
    // submit endpoint'ini kullanıyoruz çünkü claim endpoint'i görevi kilitliyor.
    const response = await axios.post(`/tasks/${taskId}/submit`, initialData);
    return response.data;
};

// 4. (Eski Yöntem) Görevi Üzerine Al
// NOT: Bu fonksiyonu kullanırsan görev 'ASSIGNED' olur ve başkalarına kapanır.
// Çoklu çalışma için yukarıdaki 'startTaskProcess'i kullan.
export const claimTask = async (taskId) => {
    const response = await axios.post(`/tasks/${taskId}/claim`);
    return response.data;
};

// 5. Görevi Teslim Et (Final Teslim)
// Engineer işi bitirdiğinde burayı kullanacak
export const submitTask = async (taskId, submissionData) => {
    // submissionData: { notes: "Bitirdim, işte link...", attachmentUrl: "github.com/..." }
    const response = await axios.post(`/tasks/${taskId}/submit`, submissionData);
    return response.data;
};

// 6. Tek bir görevin detayını getir
export const getTaskById = async (id) => {
    const response = await axios.get(`/tasks/${id}`);
    return response.data;
};