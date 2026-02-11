import { Header } from '../components/header';
import { VideoPlayer } from '../components/VideoPlayer';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

export function Lesson() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex flex-col lg:flex-row">
        {/* Área do Vídeo (Esquerda) */}
        <main className="flex-1 p-4 lg:p-8 bg-brand-bg">
          <div className="max-w-5xl mx-auto">
            <VideoPlayer videoId="ID_DO_VIDEO_PANDA" />
            
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-brand-dark">Aula 01 - Introdução ao Direito Administrativo</h1>
              <p className="mt-4 text-gray-600 leading-relaxed text-lg">
                Nesta aula, abordaremos os conceitos fundamentais do regime jurídico administrativo...
              </p>
              
              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" />
                  <span className="font-medium text-blue-900 text-sm italic">Material_Complementar_Aula01.pdf</span>
                </div>
                <button className="text-blue-600 font-bold text-sm hover:underline">Download</button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar de Aulas (Direita) */}
        <aside className="w-full lg:w-96 border-l border-gray-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg text-brand-dark">Conteúdo do Curso</h2>
          </div>
          
          <nav>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${i === 1 ? 'bg-blue-50/50' : ''}`}>
                <div className="relative">
                   <CheckCircle2 size={20} className={i === 1 ? 'text-green-500' : 'text-gray-300'} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${i === 1 ? 'text-blue-600' : 'text-gray-700'}`}>Aula 0{i} - Título da aula</p>
                  <p className="text-xs text-gray-400">15:40 min</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}