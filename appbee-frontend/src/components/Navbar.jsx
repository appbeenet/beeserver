import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User, LayoutDashboard, Briefcase, Trophy } from 'lucide-react'; // Trophy eklendi
import { useAuth } from '../context/AuthContext';
import logo from '../appbee-logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Tema State'i
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        return user.role === 'company' ? '/company-dashboard' : '/engineer-dashboard';
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 transition-colors duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                {/* LOGO ALANI */}
                <Link to="/" className="flex items-center gap-3 group">
                    {logo ? (
                        <img
                            src={logo}
                            alt="AppBee Logo"
                            className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <span className="text-2xl font-bold text-blue-600">AppBee</span>
                    )}
                </Link>

                {/* Desktop Menu - Linkler */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Ana Sayfa</Link>

                    <Link to="/tasks" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1">
                        <Briefcase size={18} /> Görevler
                    </Link>

                    {/* GÜNCELLENDİ: Liderlik Tablosu İkonlu */}
                    <Link to="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1">
                        <Trophy size={18} /> Liderlik Tablosu
                    </Link>

                    {user && (user.role === 'ADMIN' || user.role === 'admin') && (
                        <Link to="/admin-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1">
                            <Briefcase size={18} /> Admin
                        </Link>
                    )}

                    {user && (
                        <Link to={getDashboardLink()} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:opacity-80 transition-opacity">
                            <LayoutDashboard size={18} />
                            Panelim
                        </Link>
                    )}
                </div>

                {/* Sağ Taraf: Dark Mode + Auth Durumu */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
                        title="Temayı Değiştir"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <span className="capitalize">{user.username || user.name || "Kullanıcı"}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 border border-red-200 dark:border-red-900/30 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} /> Çıkış
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Giriş Yap</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">Hemen Başla</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400">
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button className="text-gray-600 dark:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 absolute w-full transition-colors duration-300 shadow-xl">
                    <div className="flex flex-col p-6 space-y-4">
                        <Link to="/" className="text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>Ana Sayfa</Link>

                        <Link to="/tasks" className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <Briefcase size={18} /> Görevler
                        </Link>

                        {/* MOBİL İÇİN GÜNCELLENDİ */}
                        <Link to="/leaderboard" className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <Trophy size={18} /> Liderlik Tablosu
                        </Link>

                        {user && (user.role === 'ADMIN' || user.role === 'admin') && (
                             <Link to="/admin-dashboard" className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                <Briefcase size={18} /> Admin
                            </Link>
                        )}

                        {user && (
                            <Link to={getDashboardLink()} className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                <LayoutDashboard size={18} />
                                Panelim
                            </Link>
                        )}

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {user ? (
                            <>
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white capitalize">{user.username || user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 py-3 rounded-xl font-bold"
                                >
                                    <LogOut size={18} /> Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 font-bold text-center py-2" onClick={() => setIsOpen(false)}>Giriş Yap</Link>
                                <Link to="/register" className="bg-blue-600 text-white text-center py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>Kayıt Ol</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;