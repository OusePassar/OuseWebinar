import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Video, BarChart3, Users, GraduationCap, Plus, Link as LinkIcon } from 'lucide-react';
import ouseLogoWhite from '../images/logo_branca.png';
import ouseLogoDark from '../images/logo_preta.png';

const WEBINARS = [
    { id: 1, title: 'Workshop - AO VIVO - 25/09 CLONE', date: 'Tuesday, 23 Dec 2025, 07:00 PM' },
    { id: 2, title: 'Aula Secreta da Aprovação na PRF e PF', date: 'Wednesday, 10 Dec 2025, 08:00 PM' },
];

export function Dashboard() {
    // Pegamos o estado do tema para controlar a logo da sidebar também
    const [isDark, setIsDark] = useState(true);

    // Escuta mudanças na classe 'light' para atualizar a logo lateral
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(!document.documentElement.classList.contains('light'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex min-h-screen bg-app-bg transition-colors duration-300">
            {/* Sidebar Lateral Dinâmica */}
            <aside className="w-64 bg-app-sidebar border-r border-black/5 dark:border-white/5 flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <img
                        src={isDark ? ouseLogoWhite : ouseLogoDark}
                        alt="Ouse"
                        className="h-8 object-contain transition-opacity"
                    />
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Home" />
                    <NavItem icon={<Video size={20} />} label="Webinars" active />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
                    <NavItem icon={<Users size={20} />} label="Registrants" />
                    <NavItem icon={<GraduationCap size={20} />} label="Training" />
                </nav>
            </aside>

            <main className="flex-1 flex flex-col">
                <Header />

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold transition-colors duration-300">Webinars</h1>

                    {/* Botão Ajustado para Link */}
                    <Link
                        to="/webinars/new"
                        className="bg-jam-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center gap-2 font-bold transition-all shadow-lg shadow-jam-blue/20 hover:shadow-jam-blue/40 active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Add webinar</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    {WEBINARS.map(webinar => (
                        <div key={webinar.id} className="bg-app-card border border-black/5 dark:border-white/5 rounded-lg p-6 hover:border-jam-blue/50 transition-all shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-jam-blue/10 rounded-lg text-jam-blue">
                                        <Video size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{webinar.title}</h3>
                                        <p className="text-sm opacity-60 mt-1 italic">{webinar.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                                    <button className="hover:text-jam-blue">Edit</button>
                                    <button className="hover:text-jam-blue">Clone</button>
                                    <button className="bg-jam-blue/10 text-jam-blue px-4 py-2 rounded border border-jam-blue/20 flex items-center gap-2 hover:bg-jam-blue hover:text-white transition-all">
                                        <LinkIcon size={14} /> Links
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
      {/* O ícone dá um leve "pulo" quando você passa o mouse */}
      <div className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      {label}
    </button>
  );
}