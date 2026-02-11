import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function StepItem({ icon, label, active = false, completed = false, to = "#" }) {
  return (
    // Envolvemos o conteúdo com o Link para torná-lo clicável
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-3 px-4 min-w-25 transition-all duration-500 hover:opacity-100 ${
        active ? 'opacity-100 scale-105' : 'opacity-40 hover:scale-105'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all ${
        active 
          ? 'bg-jam-blue shadow-[0_0_20px_rgba(47,129,247,0.4)] ring-2 ring-blue-400/50' 
          : 'bg-white/5 group-hover:bg-white/10'
      }`}>
        {icon}
        {completed && (
          <div className="absolute -top-1 -right-1 bg-jam-success text-white rounded-full p-0.5 border-2 border-app-bg shadow-lg animate-in zoom-in">
            <CheckCircle2 size={12} fill="white" className="text-jam-success" />
          </div>
        )}
      </div>
      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-center">
        {label}
      </span>
    </Link>
  );
}