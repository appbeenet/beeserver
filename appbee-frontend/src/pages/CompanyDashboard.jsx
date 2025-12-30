import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layout, Save, Loader2, DollarSign, ListFilter, User, CheckCircle, Clock, PlayCircle, Eye, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// 👇 YENİ: Modal Bileşenini Import Et (Dosya yolunun doğru olduğundan emin ol)
import CompanySubmissionsModal from '../components/CompanySubmissionsModal';
const CompanyDashboard = () => {
    // --- STATE YÖNETİMİ ---
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    // 👇 YENİ: Modal State'leri
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // Giriş yapan kullanıcının adını tutacak state
    const [currentUserFullName, setCurrentUserFullName] = useState('');


    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        price: '',
        difficulty: 'EASY',
    });
    const [submitting, setSubmitting] = useState(false);

    // --- BAŞLANGIÇ (MOUNT) ---
    useEffect(() => {
        // 1. LocalStorage'dan ismi al
        const storedName = localStorage.getItem('fullName');

        if (storedName) {
            setCurrentUserFullName(storedName);
            // 2. Görevleri çek ve bu isme göre filtrele
            fetchTasks(storedName);
        } else {
            console.warn("Kullanıcı adı bulunamadı. Lütfen tekrar giriş yapın.");
            setLoadingTasks(false);
        }
    }, []);

    // --- VERİ ÇEKME FONKSİYONU ---
    const fetchTasks = async (filterName) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allTasks = res.data;

            // 1. Giriş yapan kullanıcının adını al
            let myNameRaw = filterName || currentUserFullName || localStorage.getItem('fullName') || '';
            const myName = myNameRaw.trim().toLowerCase();

            if (myName) {
                const myTasks = allTasks.filter(task => {
                    const taskCompanyName = (task.companyName || '').trim().toLowerCase();
                    // Eşleşme Mantığı: Tam eşleşme VEYA sonuna ' company' eklenmiş hali
                    return taskCompanyName === myName || taskCompanyName === `${myName} company`;
                });

                setTasks(myTasks);
            } else {
                setTasks([]);
            }

        } catch (error) {
            console.error(error);
            toast.error('Görev listesi yüklenemedi.');
        } finally {
            setLoadingTasks(false);
        }
    };

    // --- FORM İŞLEMLERİ ---
    const handleChange = (e) => {
        setTaskData({ ...taskData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...taskData,
                price: parseInt(taskData.price)
            };

            await axios.post('http://localhost:8080/api/tasks', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Görev başarıyla yayınlandı!');
            setTaskData({ title: '', description: '', price: '', difficulty: 'EASY' });

            // Listeyi güncelle
            fetchTasks(currentUserFullName);
        } catch (error) {
            console.error(error);
            toast.error('Görev oluşturulamadı.');
        } finally {
            setSubmitting(false);
        }
    };

    // 👇 YENİ: Başvuruları Açma Fonksiyonu
    const handleOpenSubmissions = (taskId) => {
        setSelectedTaskId(taskId);
        setIsModalOpen(true);
    };

    // --- UI YARDIMCILARI ---

    // 1. Zorluk Rengi
    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
            case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 2. Statü Rozeti
    const getStatusBadge = (status) => {
        switch(status) {
            case 'PUBLISHED':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"><PlayCircle size={14}/> Yayında</span>;
            case 'CLAIMED':
            case 'ASSIGNED':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"><Clock size={14}/> Çalışılıyor</span>;
            case 'COMPLETED':
            case 'APPROVED':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"><CheckCircle size={14}/> Tamamlandı</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{status}</span>;
        }
    };

    // 3. Mühendis İsimleri
    const renderEngineers = (nameString) => {
        if (!nameString) return <span className="text-gray-400 text-xs italic">- Bekleniyor -</span>;
        const names = nameString.split(',').map(n => n.trim());
        return (
            <div className="flex flex-wrap gap-2">
                {names.map((name, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                        <User size={12} />
                        {name}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                    <Layout size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Şirket Paneli</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Hoşgeldin, <span className="font-semibold text-indigo-500">{currentUserFullName || 'Misafir'}</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* SOL TARAF: GÖREV EKLEME FORMU */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-none border border-gray-100 dark:border-slate-800"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Plus className="text-indigo-600" /> Yeni Görev Yayınla
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Görev Başlığı</label>
                            <input
                                type="text"
                                name="title"
                                value={taskData.title}
                                onChange={handleChange}
                                placeholder="Örn: React Native ile Login Ekranı Tasarımı"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ücret (₺)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        value={taskData.price}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zorluk Seviyesi</label>
                                <select
                                    name="difficulty"
                                    value={taskData.difficulty}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900 dark:text-white"
                                >
                                    <option value="EASY">Kolay (Başlangıç)</option>
                                    <option value="MEDIUM">Orta (Deneyimli)</option>
                                    <option value="HARD">Zor (Uzman)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama & Gereksinimler</label>
                            <textarea
                                name="description"
                                value={taskData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Görevi detaylıca açıklayın..."
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900 dark:text-white resize-none"
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-70 active:scale-95"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Yayınla</>}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* SAĞ TARAF: BİLGİ KARTI */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-full max-h-[500px]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold mb-6">İpuçları</h3>
                        <ul className="space-y-6 text-slate-300">
                            <li className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">1</span>
                                Başlığı kısa ve açıklayıcı tutun.
                            </li>
                            <li className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">2</span>
                                Zorluk seviyesini doğru belirleyin.
                            </li>
                            <li className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">3</span>
                                Fiyatlandırmayı adil yapın.
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <div className="text-sm text-slate-400">Aktif Görevler</div>
                        <div className="text-4xl font-bold mt-2 text-white">{tasks.length}</div>
                    </div>
                </motion.div>
            </div>

            {/* --- ALT BÖLÜM: GÖREV LİSTESİ --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-none border border-gray-100 dark:border-slate-800"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ListFilter className="text-indigo-600" /> Yayınlanan Görevler
                    </h2>
                    <button onClick={() => fetchTasks(currentUserFullName)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Listeyi Yenile</button>
                </div>

                {loadingTasks ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                        <p className="text-gray-500">Henüz yayınladığınız bir görev bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm">
                                <th className="py-4 px-4 font-medium">Görev Başlığı</th>
                                <th className="py-4 px-4 font-medium">Fiyat</th>
                                <th className="py-4 px-4 font-medium">Zorluk</th>
                                <th className="py-4 px-4 font-medium">Durum</th>
                                <th className="py-4 px-4 font-medium">Mühendis</th>
                                <th className="py-4 px-4 font-medium">İşlemler</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-800 dark:text-gray-200">
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-4 font-medium">{task.title}</td>
                                    <td className="py-4 px-4 font-bold text-indigo-600">{task.price} ₺</td>
                                    <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
                                                {task.difficulty}
                                            </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        {getStatusBadge(task.status)}
                                    </td>
                                    <td className="py-4 px-4">
                                        {renderEngineers(task.assignedEngineerName)}
                                    </td>

                                    {/* --- GÜNCELLENEN İŞLEM SÜTUNU --- */}
                                    <td className="py-4 px-4">
                                        {/* Görev tamamlandıysa onaylandı yaz, değilse Başvurular butonunu göster */}
                                        {task.status === 'APPROVED' || task.status === 'COMPLETED' ? (
                                            <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                                <CheckCircle size={14} /> Onaylandı
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenSubmissions(task.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                <Eye size={14} /> Başvurular
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {isModalOpen && selectedTaskId && (
                <CompanySubmissionsModal
                    taskId={selectedTaskId}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTaskId(null);
                    }}
                    onTaskUpdated={() => {
                        // Görev onaylandıktan sonra listeyi yenile
                        fetchTasks();
                    }}
                />
            )}

            {/* Ana kapsayıcı div'in kapanışı (En dıştaki div) */}
        </div>
    );
};

export default CompanyDashboard;