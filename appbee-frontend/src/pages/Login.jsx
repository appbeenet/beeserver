import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Logo dosyanın yolu doğru değilse bu satırı yorum satırına alabilirsin:
// import logo from '../appbee-logo.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // AuthContext üzerinden backend isteği
            const result = await login(formData.email, formData.password);

            // Konsola yazdırıp gelen veriyi kontrol edelim (Geliştirme aşamasında)
            console.log("Login Sonucu:", result);

            if (result.success) {
                toast.success(`Tekrar hoşgeldin!`);

                const user = result.user || {};
                const userRole = (user.role || '').toLowerCase();

                // -----------------------------------------------------------
                // <--- KRİTİK GÜNCELLEME: ID ve İSİM KAYDETME --->

                // 1. Benzersiz ID'yi kaydet (Filtreleme hatasını çözen anahtar kısım)
                if (user.id) {
                    localStorage.setItem('userId', user.id);
                    console.log("✅ User ID güvenli şekilde kaydedildi:", user.id);
                }

                // 2. UI'da "Hoşgeldin Ahmet" yazmak için ismi de saklayalım
                if (user.fullName) {
                    localStorage.setItem('fullName', user.fullName);
                } else if (user.name) {
                    localStorage.setItem('fullName', user.name);
                }
                // -----------------------------------------------------------

                // Toast mesajının okunması için minik bir gecikme
                setTimeout(() => {
                    if (userRole === 'company') {
                        navigate('/company-dashboard');
                    } else if (userRole === 'engineer') {
                        navigate('/engineer-dashboard');
                    } else {
                        console.warn("Bilinmeyen rol tespit edildi:", userRole);
                        navigate('/'); // Rol tanımsızsa ana sayfaya at
                    }
                }, 800);
            } else {
                toast.error(result.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error('Bir bağlantı hatası oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 transition-colors duration-300 min-h-[600px] w-full max-w-6xl mx-auto my-10">

            {/* SOL TARAF - FORM ALANI */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12 relative z-10"
            >
                <div className="max-w-md mx-auto w-full">
                    {/* LOGO ALANI */}
                    <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                        <span className="text-2xl font-bold text-blue-600">AppBee</span>
                        {/* Logo resmi varsa yukarıdaki satırı silip aşağıdakini açabilirsin: */}
                        {/* <img src={logo} alt="AppBee" className="h-10 w-auto" /> */}
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Tekrar Hoşgeldin! 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Kaldığın yerden devam etmek için bilgilerini gir.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">E-posta Adresi</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ornek@email.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Şifre</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">
                                    Şifremi unuttum?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">Beni bu cihazda hatırla</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium">veya şununla devam et</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-gray-700 dark:text-gray-300">
                            <Github size={20} /> GitHub
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-gray-700 dark:text-gray-300">
                            <span className="text-xl font-bold text-red-500">G</span> Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                        Hesabın yok mu? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Hemen Kayıt Ol</Link>
                    </p>
                </div>
            </motion.div>

            {/* SAĞ TARAF - GÖRSEL & MOTİVASYON */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-indigo-950 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                {/* Arka Plan Efektleri (Blob Animation) */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-blue-200">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span>%25 Daha Hızlı Kariyer</span>
                    </div>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Yazılım Kariyerini <br/> <span className="text-blue-400">Hızlandır.</span>
                    </h2>
                    <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                        "AppBee sayesinde ilk freelance işimi aldım ve portfolyomu gerçek projelerle doldurdum. Junior geliştiriciler için harika bir başlangıç noktası."
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                            A
                        </div>
                        <div>
                            <div className="font-bold">Ahmet Yılmaz</div>
                            <div className="text-sm text-blue-300">Frontend Developer & AppBee Kullanıcısı</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;