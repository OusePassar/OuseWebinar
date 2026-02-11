import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Video, 
    BarChart3, 
    Users, 
    GraduationCap, 
    Plus, 
    Link as LinkIcon, 
    ExternalLink,
    Pencil,
    Trash2 // Importei o ícone de lixeira
} from 'lucide-react';
import ouseLogoWhite from '../images/logo_branca.png';
import ouseLogoDark from '../images/logo_preta.png';

// Importações do Firebase
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

export function Dashboard() {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(true);
    
    // Estados para os dados
    const [webinarsList, setWebinarsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Escuta mudanças no tema (Dark/Light)
    useEffect(() => {
        const checkTheme = () => setIsDark(!document.documentElement.classList.contains('light'));
        checkTheme(); 
        
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // 2. Busca os Webinars no Firebase
    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                const q = query(collection(db, "webinars"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setWebinarsList(data);
            } catch (error) {
                console.error("Erro ao buscar webinars:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWebinars();
    }, []);

    // Função auxiliar para mostrar a data do primeiro agendamento
    const getDisplayDate = (webinar) => {
        if (webinar.schedules && webinar.schedules.length > 0) {
            const first = webinar.schedules[0];
            return `${first.displayDate} às ${first.displayTime}`;
        }
        return "Not scheduled yet";
    };

    const handleOpenLink = (id) => {
        navigate(`/live/${id}`);
    };

    const handleEdit = (id) => {
        localStorage.setItem('currentWebinarId', id);
        navigate('/webinars/config');
    };

    // --- NOVA FUNÇÃO DE DELETAR ---
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este webinar? Essa ação não pode ser desfeita.");
        
        if (confirmDelete) {
            try {
                // Deleta do Firebase
                await deleteDoc(doc(db, "webinars", id));
                
                // Atualiza a lista localmente para sumir na hora sem precisar recarregar
                setWebinarsList(prevList => prevList.filter(item => item.id !== id));
            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Erro ao excluir o webinar. Tente novamente.");
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-app-bg transition-colors duration-300">
            {/* Sidebar Lateral Dinâmica */}
            <aside className="w-64 bg-app-sidebar border-r border-black/5 dark:border-white/5 flex flex-col transition-colors duration-300 hidden md:flex">
                <div className="p-6">
                    <img
                        src={isDark ? ouseLogoWhite : ouseLogoDark}
                        alt="Ouse"
                        className="h-8 object-contain transition-opacity"
                    />
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Home" active />
                    <NavItem icon={<Video size={20} />} label="Webinars" />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
                    <NavItem icon={<Users size={20} />} label="Registrants" />
                    <NavItem icon={<GraduationCap size={20} />} label="Training" />
                </nav>
            </aside>

            <main className="flex-1 flex flex-col">
                <Header />

                <div className="p-8 max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold transition-colors duration-300">Webinars</h1>
                            <p className="text-sm opacity-60 mt-1">Manage your events and recordings.</p>
                        </div>

                        <Link
                            to="/webinars/new"
                            onClick={() => localStorage.removeItem('currentWebinarId')}
                            className="bg-jam-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center gap-2 font-bold transition-all shadow-lg shadow-jam-blue/20 hover:shadow-jam-blue/40 active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                            <span>Add webinar</span>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-20 opacity-50 animate-pulse">Loading webinars...</div>
                        ) : webinarsList.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                                <p className="opacity-50 mb-4">You haven't created any webinars yet.</p>
                                <Link to="/webinars/new" className="text-jam-blue font-bold hover:underline">Create your first webinar</Link>
                            </div>
                        ) : (
                            webinarsList.map(webinar => (
                                <div key={webinar.id} className="bg-app-card border border-black/5 dark:border-white/5 rounded-lg p-6 hover:border-jam-blue/50 transition-all shadow-sm group">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-jam-blue/10 rounded-lg text-jam-blue group-hover:scale-110 transition-transform">
                                                <Video size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {webinar.internalTitle || webinar.publicTitle || "Untitled Webinar"}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm opacity-60 mt-1 italic">
                                                    <span className={`w-2 h-2 rounded-full ${webinar.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                    {getDisplayDate(webinar)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-80">
                                            <button 
                                                onClick={() => handleEdit(webinar.id)}
                                                className="flex items-center gap-2 hover:text-jam-blue transition-colors p-2"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleOpenLink(webinar.id)}
                                                className="bg-jam-blue/10 text-jam-blue px-4 py-2 rounded border border-jam-blue/20 flex items-center gap-2 hover:bg-jam-blue hover:text-white transition-all"
                                            >
                                                <ExternalLink size={14} /> Open Live
                                            </button>

                                            {/* BOTÃO DE DELETAR */}
                                            <button 
                                                onClick={() => handleDelete(webinar.id)}
                                                className="flex items-center gap-2 text-red-500/60 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded"
                                                title="Delete Webinar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${
      active 
        ? 'bg-jam-blue/10 text-jam-blue border-l-4 border-jam-blue rounded-l-none' 
        : 'opacity-60 hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-100'
    }`}>
      <div className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      {label}
    </button>
  );
}