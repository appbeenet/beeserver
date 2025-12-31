import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Code, Loader2, Eye, EyeOff, Check, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import clsx from 'clsx';
// Logo import yolunun doğru olduğundan emin ol, yoksa yorum satırına al
// import logo from '../appbee-logo.png';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '', // DÜZELTME: Backend 'fullName' bekliyor, AuthContext bunu 'name'den mapliyor.
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ENGINEER' // Backend ENUM formatı
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Yeni State: Şirketler listesi ve seçilen şirket ID'si
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');

    // Şirketleri backend'den çek
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                // Not: Bu endpoint'in public (SecurityConfig'de permitAll) olması lazım
                const res = await fetch('http://localhost:8080/api/companies');
                if (res.ok) {
                    const data = await res.json();
                    setCompanies(data);
                }
            } catch (error) {
                console.error("Şirket listesi çekilemedi:", error);
            }
        };
        fetchCompanies();
    }, []);

    // Şifre gücü hesaplama
    useEffect(() => {
        const pass = formData.password || '';
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 9) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        if (score > 4) score = 4;
        setPasswordStrength(score);
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Şifreler birbiriyle uyuşmuyor!');
            return;
        }

        setLoading(true);

        // confirmPassword'ü backend'e göndermeye gerek yok
        const { confirmPassword, ...dataToSend } = formData;

        // Eğer Firma rolü seçildiyse companyId'yi ekle
        if (formData.role === 'COMPANY' && selectedCompanyId) {
            dataToSend.companyId = parseInt(selectedCompanyId);
        }

        // Register fonksiyonunu çağır (AuthContext içindeki)
        const result = await register(dataToSend);

        if (result.success) {
            toast.success('Hesap başarıyla oluşturuldu! Yönlendiriliyorsunuz...');

            // Kullanıcı rolüne göre yönlendirme
            const role = (result.user.role || '').toLowerCase();
            setTimeout(() => {
                if (role === 'company') navigate('/company-dashboard');
                else navigate('/engineer-dashboard');
            }, 1000);

        } else {
            toast.error(result.message || 'Kayıt başarısız oldu.');
        }

        setLoading(false);
    };

    const content = {
        ENGINEER: {
            title: "Kodla, Kazan, Yüksel.",
            desc: "Gerçek dünya projelerinde yer alarak CV'ni güçlendir. XP kazanarak seviye atla ve firmaların dikkatini çek.",
            features: ["Gerçek Proje Deneyimi", "XP ve Rozet Sistemi", "Para Kazanma Fırsatı", "Mentor Desteği"],
            color: "text-blue-400",
            bg: "from-blue-900 to-slate-900"
        },
        COMPANY: {
            title: "Yetenek Keşfet, İşi Bitir.",
            desc: "Küçük tasklar için tam zamanlı birini işe almanıza gerek yok. AppBee havuzundaki yetenekli juniorlara görev verin.",
            features: ["Maliyet Avantajı", "Hızlı Teslimat", "Genç Yetenek Havuzu", "Kolay Yönetim"],
            color: "text-green-400",
            bg: "from-emerald-900 to-teal-950"
        }
    };

    return (
        <div className="flex bg-white dark:bg-slate-900 font-sans transition-colors duration-300 min-h-screen">

            {/* SOL TARAF - KAYIT FORMU */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-10 relative z-10 overflow-y-auto"
            >
                <div className="max-w-lg mx-auto w-full">
                    {/* LOGO ALANI - Logo dosyan yoksa text gösterir */}
                    <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                        <span className="text-2xl font-bold text-blue-600">AppBee</span>
                    </Link>

                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Aramıza Katıl 🚀</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Hesabını oluştur ve platformu keşfetmeye başla.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ROL SEÇİMİ */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Kullanıcı Tipi Seçin</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleRoleSelect('ENGINEER')}
                                    className={clsx(
                                        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 text-center relative overflow-hidden",
                                        formData.role === 'ENGINEER'
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600"
                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {formData.role === 'ENGINEER' && <div className="absolute top-2 right-2 text-blue-600"><CheckCircle2 size={16} /></div>}
                                    <Code size={24} />
                                    <div className="font-bold text-sm">Junior Developer</div>
                                </div>

                                <div
                                    onClick={() => handleRoleSelect('COMPANY')}
                                    className={clsx(
                                        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 text-center relative overflow-hidden",
                                        formData.role === 'COMPANY'
                                            ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-600"
                                            : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {formData.role === 'COMPANY' && <div className="absolute top-2 right-2 text-green-600"><CheckCircle2 size={16} /></div>}
                                    <Briefcase size={24} />
                                    <div className="font-bold text-sm">Firma / İşveren</div>
                                </div>
                            </div>
                        </div>

                        {/* ŞİRKET SEÇİMİ DROPDOWN (Sadece COMPANY rolü seçiliyse görünür) */}
                        {formData.role === 'COMPANY' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative group"
                            >
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Şirket Seçiniz</label>
                                <select
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="" disabled>Listeden bir şirket seçin...</option>
                                    {companies.map((comp) => (
                                        <option key={comp.id} value={comp.id}>
                                            {comp.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    *Listede şirketiniz yoksa lütfen yönetici ile iletişime geçin.
                                </p>
                            </motion.div>
                        )}


                        <div className="space-y-4">
                            {/* AD SOYAD INPUT (DÜZELTİLDİ: name='name') */}
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="name" // AuthContext ile eşleşmesi için 'username' yerine 'name'
                                    value={formData.name}
                                    placeholder={formData.role === 'COMPANY' ? "Firma Adı" : "Ad Soyad"}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition border-gray-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    placeholder="E-posta Adresi"
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition border-gray-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        placeholder="Şifre"
                                        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition border-gray-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        onChange={handleChange}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        placeholder="Şifre Tekrar"
                                        className={clsx(
                                            "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500",
                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                ? "border-red-300 focus:ring-red-200 dark:border-red-800"
                                                : "border-gray-200 dark:border-gray-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        )}
                                        onChange={handleChange}
                                        required
                                    />
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <div className="absolute right-3 top-3.5 text-red-500" title="Şifreler uyuşmuyor"><XCircle size={20} /></div>
                                    )}
                                </div>
                            </div>

                            {/* Şifre Gücü Çubuğu */}
                            {formData.password && (
                                <div className="flex gap-1 h-1.5 mt-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={clsx(
                                                "h-full rounded-full flex-1 transition-all duration-300",
                                                passwordStrength >= level
                                                    ? (passwordStrength < 2 ? "bg-red-400" : passwordStrength < 4 ? "bg-yellow-400" : "bg-green-500")
                                                    : "bg-gray-100 dark:bg-gray-700"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-2">
                            <input type="checkbox" required className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Kullanım Koşullarını</Link> ve <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Gizlilik Politikasını</Link> okudum, kabul ediyorum.
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "w-full text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 active:scale-[0.98]",
                                formData.role === 'ENGINEER'
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                                    : "bg-green-600 hover:bg-green-700 shadow-green-500/30"
                            )}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Hesap Oluştur'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                        Zaten hesabın var mı? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Giriş Yap</Link>
                    </p>
                </div>
            </motion.div>

            {/* SAĞ TARAF - DİNAMİK BİLGİ ALANI */}
            <motion.div
                key={formData.role}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={clsx(
                    "hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-16 text-white bg-gradient-to-br transition-colors duration-500",
                    content[formData.role].bg
                )}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="absolute top-10 right-10 w-40 h-40 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-60 h-60 border border-white/10 rounded-full"></div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        {content[formData.role].title}
                    </h2>
                    <p className="text-xl text-white/80 mb-10 leading-relaxed">
                        {content[formData.role].desc}
                    </p>

                    <ul className="space-y-4">
                        {content[formData.role].features.map((feature, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center gap-3 text-lg font-medium"
                            >
                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center bg-white/10", content[formData.role].color)}>
                                    <Check size={18} />
                                </div>
                                {feature}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;