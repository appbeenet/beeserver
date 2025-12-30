import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Backend Portu 8080 olarak ayarlandı
    const API_URL = 'http://localhost:8080/api/auth';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("User parse hatası:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // --- LOGIN ---
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Backend hatası (401, 500 vs) varsa catch'e düşmez, response.ok false olur.
            // Spring Boot exception fırlattığında genelde JSON hata mesajı döner.
            if (!response.ok) {
                // Hata mesajını okumayı dene
                const errorData = await response.json().catch(() => ({}));
                return { success: false, message: errorData.message || 'Giriş başarısız. Bilgileri kontrol edin.' };
            }

            const data = await response.json();
            // Backend'den gelen yapı: { token, userId, role, fullName }

            // Frontend'de kullanacağımız standart yapıya çeviriyoruz:
            const userData = {
                id: data.userId,
                name: data.fullName,
                email: email, // Backend response'da email yok, inputtan alıyoruz
                role: data.role // Backend muhtemelen "ENGINEER" (büyük harf) dönüyor
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);

            return { success: true, user: userData };

        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
    };

    // --- REGISTER ---
    const register = async (formData) => {
        try {
            // Backend 'fullName' bekliyor, formdan gelen veriyi buna uygun hale getiriyoruz
            const payload = {
                fullName: formData.name, // Frontend'de 'name' kullanıyoruz, backend'e 'fullName' gönderiyoruz
                email: formData.email,
                password: formData.password,
                role: formData.role // 'ENGINEER' veya 'COMPANY'
            };

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return { success: false, message: errorData.message || 'Kayıt başarısız.' };
            }

            const data = await response.json();
            // Backend'den gelen yapı: { token, userId, role, fullName }

            const userData = {
                id: data.userId,
                name: data.fullName,
                email: formData.email,
                role: data.role
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.token);

            return { success: true, user: userData };

        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);