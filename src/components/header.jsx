// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom'; // Importação necessária

// Importação das logos conforme sua estrutura de pastas
import ouseLogoWhite from '../images/logo_branca.png';
import ouseLogoDark from '../images/logo_preta.png';

export function Header() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [isDark]);

  return (
    <header className="bg-app-header border-b border-white/10 h-20 flex items-center justify-between px-8 sticky top-0 z-[100] shadow-xl transition-colors duration-300 w-full">
      
      {/* Transformamos o container da Logo e Texto em um Link */}
      <Link to="/" className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
        <div className="flex items-center">
          <img 
            src={isDark ? ouseLogoWhite : ouseLogoDark} 
            alt="Logo Ouse Passar" 
            className="h-12 w-auto object-contain transition-opacity duration-300" 
          />
        </div>
        
        <span className={`font-black text-2xl tracking-tighter italic hidden sm:block uppercase transition-colors ${isDark ? 'text-white' : 'text-ouse-dark'}`}>
          OUSE<span className="text-ouse-yellow">PASSAR</span>
        </span>
      </Link>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-lg transition-all border ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-ouse-yellow border-white/10' 
              : 'bg-black/5 hover:bg-black/10 text-ouse-dark border-black/10'
          }`}
          title="Alternar Tema"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="bg-ouse-yellow text-ouse-dark px-6 py-2 rounded-lg font-black hover:bg-yellow-500 transition-all shadow-sm active:scale-95 uppercase text-sm tracking-wider">
          Área do Aluno
        </button>
      </div>
    </header>
  );
}