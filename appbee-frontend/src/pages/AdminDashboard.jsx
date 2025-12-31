import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Building2, 
    CheckCircle, 
    XCircle, 
    Edit2, 
    Trash2, 
    Plus, 
    Loader2,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
    getPendingUsers, 
    approveUser, 
    rejectUser, 
    getAllCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany 
} from '../services/adminService';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'companies'
    const [isLoading, setIsLoading] = useState(false);
    
    // Data States
    const [pendingUsers, setPendingUsers] = useState([]);
    const [companies, setCompanies] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [companyForm, setCompanyForm] = useState({ name: '', description: '' });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await getPendingUsers();
                setPendingUsers(data);
            } else {
                const data = await getAllCompanies();
                setCompanies(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- User Actions ---
    const handleApproveUser = async (id) => {
        if (!window.confirm('Bu kullanıcıyı onaylamak istiyor musunuz?')) return;
        try {
            await approveUser(id);
            toast.success('Kullanıcı onaylandı');
            loadData();
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const handleRejectUser = async (id) => {
        if (!window.confirm('Bu kullanıcı kaydını reddetmek ve silmek istiyor musunuz?')) return;
        try {
            await rejectUser(id);
            toast.success('Kullanıcı reddedildi');
            loadData();
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    // --- Company Actions ---
    const handleDeleteCompany = async (id) => {
        if (!window.confirm('Bu şirketi silmek istediğinize emin misiniz?')) return;
        try {
            await deleteCompany(id);
            toast.success('Şirket silindi');
            loadData();
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const handleOpenModal = (company = null) => {
        if (company) {
            setEditingCompany(company);
            setCompanyForm({ name: company.name, description: company.description || '' });
        } else {
            setEditingCompany(null);
            setCompanyForm({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await updateCompany(editingCompany.id, companyForm);
                toast.success('Şirket güncellendi');
            } else {
                await createCompany(companyForm);
                toast.success('Şirket oluşturuldu');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast.error('Kaydetme başarısız');
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Paneli</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Sistem yönetimi ve onay işlemleri</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-fit mb-6 border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'users'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Users size={18} />
                    Onay Bekleyenler
                </button>
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'companies'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Building2 size={18} />
                    Şirket Yönetimi
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : (
                    <>
                        {/* --- USERS TABLE --- */}
                        {activeTab === 'users' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">E-posta</th>
                                            <th className="px-6 py-4">İsim</th>
                                            <th className="px-6 py-4">Rol</th>
                                            <th className="px-6 py-4">Şirket</th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {pendingUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                                                    Onay bekleyen kullanıcı bulunmuyor.
                                                </td>
                                            </tr>
                                        ) : (
                                            pendingUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-slate-400">#{user.id}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{user.email}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.fullName || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                        {user.company ? user.company.name : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button 
                                                            onClick={() => handleApproveUser(user.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-colors"
                                                            title="Onayla"
                                                        >
                                                            <CheckCircle size={14} /> Onayla
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectUser(user.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-colors"
                                                            title="Reddet"
                                                        >
                                                            <XCircle size={14} /> Reddet
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- COMPANIES TABLE --- */}
                        {activeTab === 'companies' && (
                            <div className="flex flex-col">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
                                    <button 
                                        onClick={() => handleOpenModal()}
                                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <Plus size={16} /> Şirket Ekle
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Şirket Adı</th>
                                                <th className="px-6 py-4">Açıklama</th>
                                                <th className="px-6 py-4">Sahip</th>
                                                <th className="px-6 py-4 text-right">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {companies.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                                                        Kayıtlı şirket bulunmuyor.
                                                    </td>
                                                </tr>
                                            ) : (
                                                companies.map((company) => (
                                                    <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-slate-400">#{company.id}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-yellow-400">{company.name}</td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={company.description}>
                                                            {company.description || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-500 text-xs">
                                                            {company.owner ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{company.owner.fullName}</span>
                                                                    <span>{company.owner.email}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="italic text-slate-400">Sahipsiz</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right space-x-2">
                                                            <button 
                                                                onClick={() => handleOpenModal(company)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                                                            >
                                                                <Edit2 size={14} /> Düzenle
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteCompany(company.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-colors"
                                                            >
                                                                <Trash2 size={14} /> Sil
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- COMPANY MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {editingCompany ? 'Şirketi Düzenle' : 'Yeni Şirket Ekle'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Şirket Adı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white"
                                    value={companyForm.name}
                                    onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                                    placeholder="Örn: AppBee Teknoloji"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white min-h-[100px]"
                                    value={companyForm.description}
                                    onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                                    placeholder="Şirket hakkında kısa bilgi..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-400 text-slate-900 hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20"
                                >
                                    {editingCompany ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
