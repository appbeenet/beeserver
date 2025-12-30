import React, { useEffect, useState } from 'react';
import { getAllTasks } from '../services/taskService';
import { DollarSign, Briefcase, ChevronRight, CheckCircle2, Play, Layers, UserCheck, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Yönlendirme için gerekli
import TaskDetailModal from '../components/TaskDetailModal';

const EngineerDashboard = () => {
    const [myTasks, setMyTasks] = useState([]); // Sadece benim görevlerim
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- VERİ ÇEKME VE FİLTRELEME ---
    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            const allTasks = await getAllTasks();

            // BURASI DEĞİŞTİ:
            // Tüm görevleri değil, sadece "submittedByMe" veya "claimedByMe" olanları alıyoruz.
            // Yani kullanıcının "Görevi Al" diyerek listesine ekledikleri.
            const userSpecificTasks = allTasks.filter(task => task.submittedByMe || task.claimedByMe);

            setMyTasks(userSpecificTasks);
        } catch (error) {
            console.error(error);
            toast.error('Panel verileri yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    // --- MODAL İŞLEMLERİ ---
    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedTask(null), 300);
    };

    const handleTaskUpdate = () => {
        fetchMyTasks(); // Görev teslim edilirse veya değişirse listeyi yenile
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'EASY': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'HARD': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Zorluk derecesine göre filtreleme (Sadece benim görevlerim içinde)
    const filteredTasks = myTasks.filter(task => filter === 'ALL' || task.difficulty === filter);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-slate-950">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="text-blue-600"/> Panelim
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Üzerine aldığın ve çalıştığın aktif projeler.
                    </p>
                </div>

                {/* Eğer hiç görev yoksa filtreleri göstermeye gerek yok */}
                {myTasks.length > 0 && (
                    <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setFilter(item)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    filter === item
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                                )}
                            >
                                {item === 'ALL' ? 'Tümü' : item}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredTasks.length === 0 ? (
                // --- BOŞ DURUM (EMPTY STATE) ---
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 text-center px-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                        <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz Aktif Görevin Yok</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                        Çalışmaya başlamak için "Görevler" sayfasına gidip yeteneklerine uygun bir proje seçebilirsin.
                    </p>
                    {/* Görevler Sayfasına Yönlendirme Butonu */}
                    <Link
                        to="/tasks" // Router'daki Görevler sayfası yolu
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1"
                    >
                        Görev Havuzuna Git <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            layoutId={`task-${task.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleTaskClick(task)}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-slate-700 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all group cursor-pointer relative overflow-hidden"
                        >
                            {/* Aktiflik Belirteci */}
                            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                                DEVAM EDİYOR
                            </div>

                            <div className="p-6 pb-20">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", getDifficultyColor(task.difficulty))}>
                                        {task.difficulty}
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-bold flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                        <DollarSign size={16} className="mr-1" /> {task.price}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                    {task.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                    {task.description}
                                </p>
                            </div>

                            {/* --- AKSİYON BUTONU --- */}
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-50/50 dark:bg-slate-800/50 p-4 border-t border-blue-100 dark:border-slate-700 flex items-center justify-between backdrop-blur-sm">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Briefcase size={14} /> {task.companyName || "Şirket"}
                                </div>

                                <button
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <Play size={16} fill="currentColor" /> Devam Et
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <TaskDetailModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onUpdate={handleTaskUpdate}
            />
        </div>
    );
};

export default EngineerDashboard;