import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Plus,
    Layout,
    Save,
    Loader2,
    DollarSign,
    ListFilter,
    User,
    CheckCircle,
    Clock,
    PlayCircle,
    Eye,
    ChevronDown,
    ChevronUp,
    Github,
    ExternalLink,
    FileText,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ servisleri kullanıyoruz
import { getTaskSubmissions, approveTask } from '../services/taskService';

const CompanyDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        price: '',
        difficulty: 'EASY',
    });
    const [submitting, setSubmitting] = useState(false);

    // Dropdown/Expand state
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    // taskId -> submissions[]
    const [submissionsByTask, setSubmissionsByTask] = useState({});
    // taskId -> boolean loading
    const [loadingSubmissions, setLoadingSubmissions] = useState({});

    // UI için kullanıcı adı
    const currentUserFullName = useMemo(() => {
        return localStorage.getItem('fullName') || '';
    }, []);

    // --- FETCH TASKS ---
    const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
            const token = localStorage.getItem('token');

            // ✅ Backend zaten COMPANY rolünde /api/tasks çağrısında sadece kendi company görevlerini döndürüyor
            const res = await axios.get('http://localhost:8080/api/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Görev listesi yüklenemedi.');
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // --- FORM ---
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
                price: parseInt(taskData.price, 10),
            };

            await axios.post('http://localhost:8080/api/tasks', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Görev başarıyla yayınlandı!');
            setTaskData({ title: '', description: '', price: '', difficulty: 'EASY' });

            await fetchTasks();
        } catch (error) {
            console.error(error);
            toast.error('Görev oluşturulamadı.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- DROPDOWN / SUBMISSIONS ---
    const toggleTaskExpand = async (taskId) => {
        if (expandedTaskId === taskId) {
            setExpandedTaskId(null);
            return;
        }

        setExpandedTaskId(taskId);

        // Daha önce çekildiyse tekrar çekme
        if (submissionsByTask[taskId]) return;

        setLoadingSubmissions((prev) => ({ ...prev, [taskId]: true }));
        try {
            const subs = await getTaskSubmissions(taskId);
            setSubmissionsByTask((prev) => ({ ...prev, [taskId]: subs || [] }));
        } catch (err) {
            console.error(err);
            toast.error('Başvurular yüklenirken hata oluştu.');
            setSubmissionsByTask((prev) => ({ ...prev, [taskId]: [] }));
        } finally {
            setLoadingSubmissions((prev) => ({ ...prev, [taskId]: false }));
        }
    };

    const handleApproveTask = async (taskId) => {
        if (!window.confirm('Bu görevi onaylayıp tamamlamak istiyor musunuz?')) return;

        const toastId = toast.loading('Onaylanıyor...');
        try {
            await approveTask(taskId);
            toast.success('Görev onaylandı ve tamamlandı ✅', { id: toastId });

            // görevleri yenile
            await fetchTasks();

            // dropdown açıkken de içeriği güncellemek için submissions tekrar çekilebilir (opsiyonel)
            // ama status değiştiği için tabloda görünecek.
        } catch (err) {
            console.error(err);
            toast.error('Onaylama işlemi başarısız oldu.', { id: toastId });
        }
    };

    const handleRejectPlaceholder = () => {
        toast('Reddetme özelliği backend’de yok (yakında).', { icon: '🚧' });
    };

    // --- UI HELPERS ---
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'EASY':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
            case 'HARD':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            <PlayCircle size={14} /> Yayında
          </span>
                );
            case 'CLAIMED':
            case 'ASSIGNED':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
            <Clock size={14} /> Çalışılıyor
          </span>
                );
            case 'COMPLETED':
            case 'APPROVED':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle size={14} /> Tamamlandı
          </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </span>
                );
        }
    };

    const renderAssignedEngineer = (nameString) => {
        if (!nameString) return <span className="text-gray-400 text-xs italic">- Bekleniyor -</span>;
        const names = nameString.split(',').map((n) => n.trim());
        return (
            <div className="flex flex-wrap gap-2">
                {names.map((name, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100 dark:border-indigo-800"
                    >
                        <User size={12} />
                        {name}
                    </div>
                ))}
            </div>
        );
    };

    const formatDateTR = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('tr-TR');
        } catch {
            return '—';
        }
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
                        Hoşgeldin, <span className="font-semibold text-indigo-500">{currentUserFullName || 'Firma'}</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* SOL: GÖREV EKLEME */}
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
                            />
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

                {/* SAĞ: BİLGİ */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-full max-h-[500px]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-3xl opacity-20 rounded-full" />
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

            {/* TASK LIST */}
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
                    <button onClick={fetchTasks} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Listeyi Yenile
                    </button>
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
                                <th className="py-4 px-4 font-medium">Görev</th>
                                <th className="py-4 px-4 font-medium">Fiyat</th>
                                <th className="py-4 px-4 font-medium">Zorluk</th>
                                <th className="py-4 px-4 font-medium">Durum</th>
                                <th className="py-4 px-4 font-medium">Atanan</th>
                                <th className="py-4 px-4 font-medium">Başvurular</th>
                            </tr>
                            </thead>

                            <tbody className="text-gray-800 dark:text-gray-200">
                            {tasks.map((task) => {
                                const isExpanded = expandedTaskId === task.id;
                                const subs = submissionsByTask[task.id] || [];
                                const subsLoading = !!loadingSubmissions[task.id];

                                const isFinalized = task.status === 'APPROVED' || task.status === 'COMPLETED';

                                return (
                                    <React.Fragment key={task.id}>
                                        {/* Row */}
                                        <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-4 font-medium">{task.title}</td>
                                            <td className="py-4 px-4 font-bold text-indigo-600">{task.price} ₺</td>
                                            <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm">{getStatusBadge(task.status)}</td>
                                            <td className="py-4 px-4">{renderAssignedEngineer(task.assignedEngineerName)}</td>

                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => toggleTaskExpand(task.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                                                >
                                                    <Eye size={14} />
                                                    Gör
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expandable dropdown row */}
                                        <tr className="border-b border-gray-100 dark:border-slate-800">
                                            <td colSpan={6} className="p-0">
                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 py-5 bg-gray-50 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-800">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                                                        <AlertCircle size={16} className="text-gray-400" />
                                                                        Başvuran / Görevi Alan Kullanıcılar
                                                                    </div>

                                                                    {/* Task finalize ise butonları kapat */}
                                                                    <div className="flex items-center gap-2">
                                                                        {!isFinalized ? (
                                                                            <button
                                                                                onClick={() => handleApproveTask(task.id)}
                                                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-colors"
                                                                            >
                                                                                <CheckCircle size={14} /> Görevi Onayla
                                                                            </button>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                          <CheckCircle size={14} /> Onaylandı
                                        </span>
                                                                        )}

                                                                        {!isFinalized && (
                                                                            <button
                                                                                onClick={handleRejectPlaceholder}
                                                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                                                            >
                                                                                <XCircle size={14} /> Reddet (yakında)
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {subsLoading ? (
                                                                    <div className="flex items-center gap-2 text-gray-500 py-6 justify-center">
                                                                        <Loader2 className="animate-spin" size={18} />
                                                                        <span className="text-sm">Başvurular yükleniyor...</span>
                                                                    </div>
                                                                ) : subs.length === 0 ? (
                                                                    <div className="text-sm text-gray-500 py-6 text-center">
                                                                        Henüz bu görev için bir başvuru / sahiplenme yok.
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {subs.map((sub) => {
                                                                            const engineerName = sub.engineer?.fullName || 'İsimsiz Mühendis';
                                                                            const engineerEmail = sub.engineer?.email || '';
                                                                            const submittedAt = sub.submittedAt; // ✅ entity’de var
                                                                            const notes = sub.notes || '';
                                                                            const link = sub.attachmentUrl || '';

                                                                            const isSubmitted = !!(notes?.trim() || link?.trim());

                                                                            return (
                                                                                <div
                                                                                    key={sub.id}
                                                                                    className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm"
                                                                                >
                                                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                                                        <div className="flex items-start gap-3">
                                                                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                                                                <User size={18} />
                                                                                            </div>

                                                                                            <div>
                                                                                                <div className="font-bold text-gray-900 dark:text-white">
                                                                                                    {engineerName}
                                                                                                </div>
                                                                                                {engineerEmail && (
                                                                                                    <div className="text-xs text-gray-500">{engineerEmail}</div>
                                                                                                )}
                                                                                                <div className="text-xs text-gray-500 mt-1">
                                                    <span className="inline-flex items-center gap-1">
                                                      <Clock size={12} />
                                                        {formatDateTR(submittedAt)}
                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex items-center gap-2">
                                                <span
                                                    className={
                                                        isSubmitted
                                                            ? 'px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                            : 'px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100'
                                                    }
                                                >
                                                  {isSubmitted ? 'Çözüm Gönderildi' : 'Sadece Sahiplendi'}
                                                </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        <div className="bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-100 dark:border-slate-700 p-3">
                                                                                            <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                                                                                <FileText size={14} /> Notlar
                                                                                            </div>
                                                                                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                                                {notes?.trim() ? notes : <span className="text-gray-400 italic">Not yok.</span>}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-100 dark:border-slate-700 p-3">
                                                                                            <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                                                                                <Github size={14} /> Proje Linki
                                                                                            </div>
                                                                                            {link?.trim() ? (
                                                                                                <a
                                                                                                    href={link}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
                                                                                                >
                                                                                                    Repo’yu Aç <ExternalLink size={14} />
                                                                                                </a>
                                                                                            ) : (
                                                                                                <span className="text-gray-400 italic text-sm">Link yok.</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CompanyDashboard;