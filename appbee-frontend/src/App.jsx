import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EngineerDashboard from './pages/EngineerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import TasksPage from './pages/TasksPage';
import Leaderboard from './pages/Leaderboard'; // 1. EKLEME: Import Et
import { Loader2 } from 'lucide-react';

// Korumalı Route Bileşeni
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role ? user.role.toLowerCase() : '';
    const isAuthorized = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (allowedRoles && !isAuthorized) {
        console.warn(`Yetkisiz Giriş: Kullanıcı rolü (${userRole}) izin verilenlerle (${allowedRoles}) uyuşmuyor.`);
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <>
            <CustomCursor />
            <Toaster position="top-right" toastOptions={{ duration: 3000, className: 'dark:bg-slate-800 dark:text-white' }} />

            <div className="flex flex-col min-h-screen font-sans antialiased relative z-0 cursor-none md:cursor-auto dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

                <Navbar />

                <main className="flex-grow pt-20 px-4 md:px-0">
                    <Routes>
                        {/* PUBLIC ROUTES (Herkese Açık) */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* 2. EKLEME: Liderlik Tablosu Rotası */}
                        <Route path="/leaderboard" element={<Leaderboard />} />

                        {/* --- GÖREV HAVUZU (MARKET) --- */}
                        <Route
                            path="/tasks"
                            element={
                                <ProtectedRoute allowedRoles={['engineer', 'admin']}>
                                    <TasksPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* --- MÜHENDİS PANELİ --- */}
                        <Route
                            path="/engineer-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['engineer', 'admin']}>
                                    <EngineerDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* --- ŞİRKET PANELİ --- */}
                        <Route
                            path="/company-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['company', 'admin']}>
                                    <CompanyDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>

                <Footer />

            </div>
        </>
    );
}

export default App;