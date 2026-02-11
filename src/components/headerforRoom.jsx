import { ShieldCheck } from 'lucide-react';
import ouseLogoWhite from '../images/logo_branca.png';

export function HeaderForRoom() {
  return (
    <header className="bg-[#1A1A1A] border-b border-white/10 h-16 flex items-center justify-between px-6 z-100 w-full shadow-2xl">
      
      {/* Lado Esquerdo: Identidade (Estática para evitar saída da página) */}
      <div className="flex items-center gap-3">
        <img 
          src={ouseLogoWhite} 
          alt="Logo Ouse Passar" 
          className="h-8 w-auto object-contain" 
        />
        <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
        <span className="font-black text-lg tracking-tighter italic text-white uppercase flex items-center gap-2">
          OUSE<span className="text-yellow-500">LIVE</span>
          <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse ml-2 tracking-widest text-white font-bold">
            AO VIVO
          </span>
        </span>
      </div>
      
      {/* Lado Direito: Status e Suporte */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} className="text-green-500" />
          Conexão Segura
        </div>

        {/* Botão de Suporte via WhatsApp (Abre em nova aba) */}
        <a 
          href="https://wa.me/SEU_NUMERO_AQUI" 
          target="_blank" 
          rel="noreferrer"
          className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-bold transition-all text-xs uppercase tracking-wider shadow-sm active:scale-95"
        >
          Suporte
        </a>
      </div>
    </header>
  );
}