import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Trophy, Code2, Briefcase, Target,
    CheckCircle2, Users, Star, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Alt Bileşenler ---

// 1. İstatistik Sayacı (Dark Mode Uyumlu)
const StatCard = ({ number, label, icon: Icon }) => (
    <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 group">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{number}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
        </div>
    </div>
);

// 2. Sıkça Sorulan Sorular Kartı (Dark Mode Uyumlu)
const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
            >
                <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {question}
                </span>
                {isOpen
                    ? <ChevronUp size={20} className="text-blue-500" />
                    : <ChevronDown size={20} className="text-gray-400 dark:text-gray-500" />
                }
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Ana Sayfa Bileşeni ---

const Home = () => {
    const [activeTab, setActiveTab] = useState('junior'); // 'junior' veya 'company'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-gray-200 selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">

            {/* ---------------- HERO SECTION ---------------- */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                {/* Arka Plan: Grid + Gradient + Blobs */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-40 pointer-events-none">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute top-40 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        Beta Sürümü Yayında!
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900 dark:text-white"
                    >
                        Kodla. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">XP Kazan.</span> <br/>
                        Geleceği İnşa Et.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Junior geliştiriciler gerçek projelerle deneyim kazanırken, firmalar işlerini hızla tamamlıyor. AppBee, yazılım dünyasının yeni oyun alanı.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link to="/register" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all duration-300">
                            Görev Avına Başla <ArrowRight size={20} />
                        </Link>
                        <Link to="/explore" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 active:scale-95 transition-all duration-300">
                            Yetenek Keşfet
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* ---------------- STATS SECTION ---------------- */}
            <section className="container mx-auto px-6 -mt-16 relative z-20 mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    <StatCard number="500+" label="Aktif Geliştirici" icon={Users} />
                    <StatCard number="1,200+" label="Tamamlanan Task" icon={CheckCircle2} />
                    <StatCard number="₺85.000+" label="Dağıtılan Ödül" icon={Star} />
                </motion.div>
            </section>

            {/* ---------------- NASIL ÇALIŞIR? (TABS) ---------------- */}
            <section className="py-20 bg-white dark:bg-slate-900/50 transition-colors">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Süreç Nasıl İşliyor?</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">İster deneyim kazanmak isteyen bir yazılımcı ol, ister işini halletmek isteyen bir girişimci. Süreç çok basit.</p>
                    </div>

                    {/* Tab Butonları */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-2 border border-gray-200 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('junior')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'junior' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                Junior Geliştirici
                            </button>
                            <button
                                onClick={() => setActiveTab('company')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'company' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                Firma / İşveren
                            </button>
                        </div>
                    </div>

                    {/* Tab İçeriği */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            key={activeTab} // Tab değişince animasyon tetiklenir
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            {activeTab === 'junior' ? (
                                <>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Profilini Oluştur</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Yeteneklerini seç, GitHub hesabını bağla ve seviyeni belirle.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Sana Uygun Taskı Seç</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Frontend, Backend veya UI... Seviyene uygun bir görev al ve kodlamaya başla.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Teslim Et & XP Kazan</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Kodun onaylandığında XP puanı kazan, seviye atla ve ödemeni al.</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">1</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Task Oluştur</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Yapılacak işi tanımla, bütçeyi ve zorluk derecesini belirle.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">2</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Geliştiriciyi Seç</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Başvuran juniorların profillerini incele ve en uygun adaya görevi ver.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">3</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Hızlı Teslimat</h3>
                                            <p className="text-gray-600 dark:text-gray-400">İş tamamlandığında kodu incele, onayla ve zaman kazan.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Sağ Taraf Görsel Alanı */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-100 dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 relative overflow-hidden h-[400px] flex items-center justify-center shadow-inner"
                        >
                            {/* Arka plan grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                            <div className="text-center opacity-70 relative z-10">
                                {activeTab === 'junior'
                                    ? <Code2 size={120} className="text-blue-400 dark:text-blue-500/50 mx-auto mb-4 drop-shadow-2xl" />
                                    : <Briefcase size={120} className="text-indigo-400 dark:text-indigo-500/50 mx-auto mb-4 drop-shadow-2xl" />
                                }
                                <p className="font-bold text-2xl text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {activeTab === 'junior' ? 'Developer Dashboard' : 'Company Panel'}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ---------------- AVANTAJLAR (KARTLAR) ---------------- */}
            <section className="py-24 bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Neden AppBee?</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Trophy className="text-yellow-500" />, title: "Gamified Kariyer", desc: "Sıkıcı CV'ler yok. XP puanları ve rozetlerinle konuş." },
                            { icon: <Zap className="text-blue-500" />, title: "Hızlı Deneyim", desc: "Gerçek projelerde çalışarak öğrenme sürecini 3 kat hızlandır." },
                            { icon: <Target className="text-red-500" />, title: "Odaklı Görevler", desc: "Büyük projelerde kaybolma. Küçük, yönetilebilir parçalarla ilerle." },
                            { icon: <Users className="text-green-500" />, title: "Geniş Network", desc: "Sektördeki diğer geliştiriciler ve firmalarla bağlantı kur." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-slate-700 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center mb-6 text-2xl">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- LEADERBOARD PREVIEW ---------------- */}
            <section className="py-20 bg-white dark:bg-slate-900/50 overflow-hidden border-y border-gray-100 dark:border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-bold mb-4">
                            🏆 Rekabet Kızışıyor
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">En İyiler Arasına Gir</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                            Her ay en çok XP toplayan geliştiriciler listelenir ve sürpriz ödüller kazanır. Sıralamada yükselmek için daha fazla görev tamamla.
                        </p>
                        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold text-lg hover:underline flex items-center gap-2">
                            Liderlik tablosunu gör <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Temsili Liderlik Tablosu Kartı */}
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-gray-700">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Trophy className="text-yellow-400" /> Haftanın Liderleri
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: "Ahmet Y.", xp: "2400 XP", role: "Frontend Dev", color: "bg-yellow-500" },
                                    { name: "Elif K.", xp: "2150 XP", role: "Backend Dev", color: "bg-gray-400" },
                                    { name: "Can B.", xp: "1900 XP", role: "Fullstack Dev", color: "bg-orange-600" },
                                ].map((user, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                                        <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center font-bold text-sm text-white shadow-lg`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.role}</div>
                                        </div>
                                        <div className="font-mono text-yellow-400 font-bold">{user.xp}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- S.S.S (FAQ) ---------------- */}
            <section className="py-24 bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Sıkça Sorulan Sorular</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                        <FaqItem
                            question="Junior seviyesinde değilim, yine de katılabilir miyim?"
                            answer="Elbette! Platformumuz her seviyeden geliştiriciye açıktır ancak görevlerin çoğu junior-mid seviye deneyim kazanmaya odaklıdır."
                        />
                        <FaqItem
                            question="Ödemeler nasıl yapılıyor?"
                            answer="Görev tamamlanıp firma tarafından onaylandığında bakiyeniz hesabınıza yansır. Belirli bir alt limite ulaştığınızda banka hesabınıza çekebilirsiniz."
                        />
                        <FaqItem
                            question="XP puanları ne işe yarıyor?"
                            answer="XP puanları seviye atlamanızı sağlar. Yüksek seviyeli geliştiriciler daha karmaşık ve yüksek bütçeli görevlere erişim hakkı kazanır."
                        />
                        <FaqItem
                            question="Firma olarak task açmak ücretli mi?"
                            answer="Task açmak ücretsizdir. Sadece iş tamamlandığında geliştiriciye ödeme yaparsınız ve platform küçük bir komisyon alır."
                        />
                    </div>
                </div>
            </section>

            {/* ---------------- FOOTER CTA ---------------- */}
            <section className="relative py-24 bg-blue-900 dark:bg-blue-950 overflow-hidden text-center px-6">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Kariyerini Şansa Bırakma, <br/> <span className="text-blue-300">İnşa Etmeye Başla.</span>
                    </h2>
                    <p className="text-blue-100 text-lg mb-10">
                        Binlerce geliştirici ve firma arasına katıl. İlk görevini bugün tamamla.
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-900 px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:bg-blue-50 hover:shadow-white/20 transition-all transform hover:-translate-y-1">
                        Hemen Ücretsiz Katıl
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Home;