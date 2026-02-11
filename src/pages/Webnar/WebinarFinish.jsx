import { useState } from 'react'; // Removi o useEffect que não é mais necessário
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { StepItem } from '../../components/StepItem';
import { 
  CheckCircle2, 
  Settings, 
  Calendar, 
  ClipboardList, 
  Copy, 
  ExternalLink, 
  ArrowRight,
  Share2
} from 'lucide-react';

export default function WebinarFinish() {
  const navigate = useNavigate();
  
  // CORREÇÃO: Inicializa o estado buscando direto no localStorage (Lazy Initialization)
  // Isso evita o erro e o duplo render
  const [webinarId] = useState(() => localStorage.getItem('currentWebinarId'));
  
  const [copied, setCopied] = useState(false);

  // Gera o link completo da sala baseada na URL atual
  const liveLink = webinarId ? `${window.location.origin}/live/${webinarId}` : '';

  const handleCopy = () => {
    if (!liveLink) return;
    navigator.clipboard.writeText(liveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">
      <Header />
      
      <main className="max-w-5xl mx-auto p-8 pt-10">
        
        {/* NAVEGAÇÃO SUPERIOR - Todos os passos completados */}
        <div className="flex justify-center items-center gap-12 mb-12 border-b border-white/5 pb-10">
          <StepItem to="/webinars/config" icon={<Settings size={18}/>} label="Configuration" completed active />
          <StepItem to="/webinars/schedule" icon={<Calendar size={18}/>} label="Schedules" completed active />
          <StepItem to="/webinars/registration" icon={<ClipboardList size={18}/>} label="Registration" completed active />
          <StepItem to="/webinars/finish" icon={<CheckCircle2 size={18}/>} label="Finish" completed active />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
          
          {/* Ícone de Sucesso Animado */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/20 shadow-2xl shadow-green-500/10">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Your webinar is ready!</h1>
            <p className="text-lg opacity-60 max-w-xl mx-auto leading-relaxed">
              Congratulations! Your automated webinar has been successfully configured, scheduled, and published.
            </p>
          </div>

          {/* Card do Link */}
          <div className="bg-app-card border border-white/10 rounded-2xl p-8 shadow-2xl mt-8 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-jam-blue"></div>
            
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
              <Share2 size={14} /> Share this link with your audience
            </h3>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 bg-black/20 border border-white/5 rounded-lg p-4 font-mono text-sm text-jam-blue truncate w-full">
                {liveLink || "Loading link..."}
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleCopy}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    copied 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>

                <a 
                  href={liveLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-jam-blue text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16}/> Open Room
                </a>
              </div>
            </div>
          </div>

          {/* Botões Finais */}
          <div className="flex justify-center gap-6 pt-8">
            <button 
              onClick={() => navigate('/')}
              className="px-10 py-4 rounded-xl bg-transparent border border-white/10 text-app-text font-bold uppercase text-xs tracking-[0.2em] hover:bg-white/5 transition-all flex items-center gap-3"
            >
              <ArrowRight size={16} className="rotate-180" /> Back to Dashboard
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}