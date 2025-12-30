import React, { useEffect, useState } from 'react';
import { getAllTasks, startTaskProcess } from '../services/taskService';
import { PlusCircle, CheckCircle2, Search, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await getAllTasks();
            setTasks(data);
        } catch (error) {
            toast.error('Görev listesi yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // --- PANELİME EKLEME FONKSİYONU ---
    const handleAddToPanel = async (task) => {
        const toastId = toast.loading('Paneline ekleniyor...');
        try {
            // Backend'de "submission" başlatarak görevi kullanıcıyla ilişkilendiriyoruz
            await startTaskProcess(task.id);

            toast.success('Görev Panelim sayfasına eklendi!', { id: toastId });

            // Listeyi yenile (Butonun "Eklendi" olarak değişmesi için)
            fetchTasks();
        } catch (error) {
            console.error(error);
            toast.error('Eklenirken hata oluştu.', { id: toastId });
        }
    };

    // Arama Filtresi
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-slate-950">
            <Toaster position="top-right" />

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tüm Görevler</h1>
                    <p className="text-gray-500">Yeteneklerine uygun görevleri bul ve paneline ekle.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Görev ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="text-center py-20">Yükleniyor...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task, index) => {
                        // Kontrol: Bu görevi zaten almış mıyım?
                        const isAdded = task.submittedByMe || task.claimedByMe;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                        {task.difficulty}
                                    </span>
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-sm">
                                        ${task.price}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                                    {task.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Briefcase size={14} /> {task.companyName || "Şirket"}
                                    </div>

                                    {isAdded ? (
                                        <button disabled className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-semibold cursor-default">
                                            <CheckCircle2 size={18} /> Panelde Ekli
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToPanel(task)}
                                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
                                        >
                                            <PlusCircle size={18} /> Paneline Ekle
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TasksPage;