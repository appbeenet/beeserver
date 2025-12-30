import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Coins, Trophy, Github, Loader2, Building, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
// 👇 Servis fonksiyonlarımızı import ettik
import { claimTask, submitTask } from '../services/taskService';

const TaskDetailModal = ({ task, isOpen, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    // Form Verileri
    const [submissionData, setSubmissionData] = useState({
        notes: '',
        attachmentUrl: ''
    });

    if (!isOpen || !task) return null;

    // --- 1. GÖREVİ ÜZERİNE ALMA (CLAIM) ---
    const handleClaim = async () => {
        setLoading(true);
        try {
            // Servis fonksiyonunu kullanıyoruz (Token otomatik ekleniyor)
            await claimTask(task.id);

            toast.success("Görev alındı! Kodlamaya başla. 🚀");
            if (onUpdate) onUpdate(); // Listeyi yenile
            onClose(); // Modalı kapat
        } catch (error) {
            console.error(error);
            // Hata mesajını yakala (Backend'den geliyorsa)
            const errorMsg = error.response?.data?.message || "Görevi alırken hata oluştu.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. GÖREVİ TESLİM ETME (SUBMIT) ---
    const handleSubmitTask = async (e) => {
        e.preventDefault();

        if (!submissionData.attachmentUrl) {
            toast.error("Lütfen GitHub veya proje linkini ekle.");
            return;
        }

        setLoading(true);
        try {
            // Servis fonksiyonunu kullanıyoruz
            await submitTask(task.id, {
                notes: submissionData.notes,
                attachmentUrl: submissionData.attachmentUrl
            });

            toast.success("Çözüm gönderildi! Onay bekleniyor. 🎉");
            if (onUpdate) onUpdate(); // Listeyi yenile
            onClose(); // Modalı kapat
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Gönderim sırasında hata oluştu.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- DURUM KONTROLLERİ ---
    const isAvailable = !task.claimedByMe && !task.submittedByMe;
    const isActive = task.claimedByMe && !task.submittedByMe;
    const isSubmitted = task.submittedByMe;

    // Renk Yardımcısı
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'HARD': return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            default: return 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* MODAL KUTUSU */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* HEADER */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50 dark:bg-slate-800/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getDifficultyColor(task.difficulty)}`}>
                                            {task.difficulty}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                                            <Building size={12} /> {task.companyName || 'Gizli Firma'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight pr-4">
                                        {task.title}
                                    </h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* BODY (Scrollable) */}
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                                {/* ÜCRET & XP KARTLARI */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Fiyat */}
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                                            <Coins size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ödül</div>
                                            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                                {task.price} <span className="text-sm font-normal text-blue-600/70">TL</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* XP Hesabı */}
                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-300">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kazanım</div>
                                            <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
                                                {task.difficulty === 'HARD' ? '+500 XP' : task.difficulty === 'MEDIUM' ? '+300 XP' : '+100 XP'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AÇIKLAMA */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-gray-400" />
                                        Görev Detayları
                                    </h3>
                                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </div>
                                </div>

                                {/* --- AKSİYON ALANLARI --- */}

                                {/* DURUM 1: GÖREV MÜSAİT (AVAILABLE) */}
                                {isAvailable && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
                                        <Clock className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-bold text-amber-800 dark:text-amber-400">Görevi almaya hazır mısın?</h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                "Görevi Al" butonuna bastığında bu görev senin listene eklenecek ve diğer adaylara kapanmayacak (Multi-Junior Mode).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* DURUM 2: GÖREV ALINMIŞ, TESLİM BEKLİYOR (ACTIVE) */}
                                {isActive && (
                                    <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-700">
                                            <Send size={18} className="text-blue-500"/>
                                            Çözümünü Gönder
                                        </h3>
                                        <form onSubmit={handleSubmitTask} className="space-y-4">
                                            {/* Github Link Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Proje Linki (GitHub/GitLab)</label>
                                                <div className="relative group">
                                                    <Github className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                    <input
                                                        type="url"
                                                        placeholder="https://github.com/username/project-repo"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all font-medium"
                                                        value={submissionData.attachmentUrl}
                                                        onChange={(e) => setSubmissionData({...submissionData, attachmentUrl: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Notes Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Mühendis Notu (Opsiyonel)</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Projede kullanılan teknolojiler, kurulum adımları vb..."
                                                    className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all resize-none text-sm"
                                                    value={submissionData.notes}
                                                    onChange={(e) => setSubmissionData({...submissionData, notes: e.target.value})}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* DURUM 3: GÖREV TESLİM EDİLMİŞ (SUBMITTED) */}
                                {isSubmitted && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl border border-green-100 dark:border-green-800 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce-slow">
                                            <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Çözümün Başarıyla İletildi!</h3>
                                        <p className="text-green-700 dark:text-green-300 mt-2 max-w-sm">
                                            Firma yetkilisi çözümünü inceleyip onayladığında XP puanın hesabına yansıyacaktır.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER - BUTONLAR */}
                            {!isSubmitted && (
                                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Kapat
                                    </button>

                                    {isAvailable && (
                                        <button
                                            onClick={handleClaim}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Görevi Al ve Başla'}
                                        </button>
                                    )}

                                    {isActive && (
                                        <button
                                            onClick={handleSubmitTask}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Gönderimi Tamamla'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailModal;