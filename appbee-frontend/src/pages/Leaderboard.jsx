import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, User, Loader2, AlertTriangle } from 'lucide-react';
import { getAllUsers } from '../services/userService';
import clsx from 'clsx';

// --- YEDEK (MOCK) VERİLER ---
// Backend 403 verirse bu devreye girecek
const MOCK_LEADERS = [
    { id: 1, username: "Ahmet Yılmaz", role: "SENIOR_ENGINEER", xp: 2450 },
    { id: 2, username: "Zeynep Kaya", role: "ENGINEER", xp: 1980 },
    { id: 3, username: "Mehmet Demir", role: "ENGINEER", xp: 1650 },
    { id: 4, username: "Ayşe Çelik", role: "JUNIOR_ENGINEER", xp: 1200 },
    { id: 5, username: "Caner Erkin", role: "ENGINEER", xp: 950 },
    { id: 6, username: "Elif Su", role: "ENGINEER", xp: 800 },
];

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingMockData, setUsingMockData] = useState(false); // Mock veri mi kullanıyoruz?

    useEffect(() => {
        const fetchAndSortUsers = async () => {
            setLoading(true);
            try {
                // 1. Gerçek veriyi çekmeyi dene
                const allUsers = await getAllUsers();

                // Veriyi işle
                const sortedUsers = allUsers
                    .filter(u => u.role && u.role.toLowerCase().includes('engineer'))
                    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

                setLeaders(sortedUsers);
                setUsingMockData(false);

            } catch (err) {
                console.warn("Backend verisi çekilemedi (403), mock veri devreye giriyor.");

                // 2. HATA ALINIRSA YEDEK VERİYİ KULLAN
                setLeaders(MOCK_LEADERS);
                setUsingMockData(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSortUsers();
    }, []);

    const topThree = leaders.slice(0, 3);
    const others = leaders.slice(3);

    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : '??';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">

            {/* HEADER */}
            <div className="max-w-4xl mx-auto text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-4 flex items-center justify-center gap-3">
                    <Trophy size={40} className="text-yellow-500" />
                    Liderlik Tablosu
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    En çok tecrübe puanına (XP) sahip mühendislerimiz.
                </p>

                {/* Eğer Mock Veri Kullanılıyorsa Uyarı Göster */}
                {usingMockData && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium animate-pulse">
                        <AlertTriangle size={16} />
                        <span>Demo Modu: Gerçek verilere erişim izni yok.</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
                    <span className="text-gray-500">Sıralama yükleniyor...</span>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto">

                    {/* --- PODYUM ALANI (TOP 3) --- */}
                    <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-12 px-4 h-auto md:h-80">

                        {/* 2. SIRA */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="order-2 md:order-1 flex-1 flex flex-col items-center"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-gray-300 overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                                        {getInitials(topThree[1].username || topThree[1].name)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">#2</div>
                                </div>
                                <div className="mt-4 bg-white dark:bg-slate-900 w-full p-4 rounded-t-2xl border-t-4 border-gray-300 shadow-xl text-center h-48 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate px-2">{topThree[1].username || topThree[1].name}</h3>
                                    <div className="text-indigo-600 font-bold text-lg">{topThree[1].xp || 0} XP</div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1. SIRA */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="order-1 md:order-2 flex-[1.2] flex flex-col items-center z-10 -mb-4 md:mb-0"
                            >
                                <div className="relative">
                                    <Crown size={32} className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce" />
                                    <div className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl ring-4 ring-yellow-400/20 bg-yellow-100 flex items-center justify-center text-3xl font-bold text-yellow-600">
                                        {getInitials(topThree[0].username || topThree[0].name)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow-md">#1</div>
                                </div>
                                <div className="mt-4 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900 w-full p-6 rounded-t-3xl border-t-4 border-yellow-400 shadow-2xl text-center h-60 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate px-2">{topThree[0].username || topThree[0].name}</h3>
                                    <div className="text-3xl font-extrabold text-yellow-500">{topThree[0].xp || 0}</div>
                                    <span className="text-xs text-gray-400 font-semibold">XP PUANI</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. SIRA */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="order-3 md:order-3 flex-1 flex flex-col items-center"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-orange-300 overflow-hidden shadow-lg bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-500">
                                        {getInitials(topThree[2].username || topThree[2].name)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">#3</div>
                                </div>
                                <div className="mt-4 bg-white dark:bg-slate-900 w-full p-4 rounded-t-2xl border-t-4 border-orange-300 shadow-xl text-center h-40 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate px-2">{topThree[2].username || topThree[2].name}</h3>
                                    <div className="text-indigo-600 font-bold text-lg">{topThree[2].xp || 0} XP</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* --- LİSTE GÖRÜNÜMÜ --- */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                        {others.map((user, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={user.id}
                                className="flex items-center p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="w-12 text-center font-bold text-gray-400">#{index + 4}</div>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {getInitials(user.username || user.name)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{user.username || user.name}</h4>
                                        <p className="text-xs text-gray-500">{user.role}</p>
                                    </div>
                                </div>
                                <div className="w-24 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                                    {user.xp || 0} XP
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
};

export default Leaderboard;