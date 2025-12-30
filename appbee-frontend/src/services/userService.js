import axios from 'axios';

// Backend adresin (Auth context'teki veya config'deki base URL'i kullanıyorsan oradan al)
const API_URL = 'http://localhost:8080/api/users';

// Token işlemleri için helper (Eğer axios interceptor kullanmıyorsan manuel eklemek gerekebilir)
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

export const getAllUsers = async () => {
    try {
        // Backend'de "/api/users" endpoint'i genelde tüm kullanıcıları döner
        // Eğer bu endpoint sadece ADMIN'e açıksa, backend'de "permitAll" yapman gerekebilir.
        // Ama backend değiştirmeyelim dediğin için mevcut açık endpointi kullanıyoruz.
        const response = await axios.get(API_URL, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        console.error("Kullanıcı listesi çekilemedi:", error);
        throw error; // Hatayı bileşene fırlat
    }
};