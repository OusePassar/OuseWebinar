import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { WebinarChat } from '../../components/WebinarChat'; 
import { HeaderForRoom as Header } from '../../components/headerforRoom';
import { Clock, AlertCircle } from 'lucide-react';

export function WebinarRoom() {
    const { id } = useParams();
    
    // Estados principais
    const [webinar, setWebinar] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, waiting, live, error
    const [startTime, setStartTime] = useState(0); // Tempo de sincronização do vídeo em segundos
    const [currentSessionStart, setCurrentSessionStart] = useState(null); // Data da sessão atual para filtrar o chat

    // EFEITO 1: Busca os dados do Webinar no Firebase
    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                const docRef = doc(db, "webinars", id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setWebinar(docSnap.data());
                } else {
                    console.error("Webinar não encontrado");
                    setStatus('error');
                }
            } catch (error) {
                console.error("Erro ao buscar webinar:", error);
                setStatus('error');
            }
        };
        fetchWebinar();
    }, [id]);

    // EFEITO 2: O "Motor" do Fake Live (Sincronização)
    useEffect(() => {
        if (!webinar || !webinar.schedules) return;

        const checkSchedule = () => {
            const now = new Date();
            
            // Encontra o agendamento ativo
            // Regra: Considera "ao vivo" se estiver entre 10min antes e 120min (2h) depois do início agendado
            const activeSchedule = webinar.schedules.find(s => {
                const scheduleDate = new Date(s.startDate);
                const diffInMinutes = (now - scheduleDate) / 1000 / 60;
                return diffInMinutes > -10 && diffInMinutes < 120; 
            });

            if (!activeSchedule) {
                setStatus('waiting');
                return;
            }

            const scheduleDate = new Date(activeSchedule.startDate);
            setCurrentSessionStart(activeSchedule.startDate);

            // Calcula a diferença em segundos entre "agora" e o "início da aula"
            const diffSeconds = (now - scheduleDate) / 1000;

            if (diffSeconds < 0) {
                // Se for negativo, estamos no tempo de antecipação (ex: faltando 5 minutos)
                setStatus('waiting');
            } else {
                // Define o segundo exato onde o vídeo deve começar para todos estarem sincronizados
                setStartTime(Math.floor(diffSeconds));
                setStatus('live');
            }
        };

        // Roda a verificação imediatamente
        checkSchedule();

        // Verifica novamente a cada 60 segundos para atualizar o status automaticamente
        const interval = setInterval(checkSchedule, 60000);

        return () => clearInterval(interval);
    }, [webinar]);

    // --- RENDERIZAÇÃO DE ESTADOS INICIAIS ---

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jam-blue"></div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center text-white flex-col gap-4">
                <AlertCircle size={48} className="text-red-500" />
                <h1 className="text-2xl font-bold">Webinar não encontrado</h1>
                <p className="text-white/50">Verifique o link ou se o evento ainda está disponível.</p>
            </div>
        );
    }

    // --- LAYOUT PRINCIPAL ---

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col font-sans overflow-hidden">
             {/* Header superior */}
             <div className="shrink-0">
                <Header />
             </div>
             
             {/* Área de conteúdo: Vídeo à esquerda e Chat à direita */}
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
                 
                 {/* LADO ESQUERDO: PLAYER E INFORMAÇÕES */}
                 <main className="flex-1 bg-black flex flex-col relative overflow-y-auto custom-scrollbar">
                    
                    {/* Container do Player (Proporção 16:9) */}
                    <div className="w-full bg-black aspect-video relative flex items-center justify-center shadow-2xl z-10 border-b border-white/5">
                        {status === 'waiting' ? (
                            // Tela de Espera quando a aula não começou
                            <div className="flex flex-col items-center justify-center text-white text-center p-6">
                                <Clock size={48} className="text-jam-blue animate-pulse mb-4" />
                                <h1 className="text-3xl font-bold">A aula começará em breve</h1>
                                <p className="text-white/50 text-lg mt-2 italic">Aguarde, a transmissão iniciará automaticamente.</p>
                            </div>
                        ) : (
                            // Player de Vídeo Sincronizado
                            <FakeLivePlayer videoId={webinar.videoId} startTime={startTime} />
                        )}
                    </div>

                    {/* Títulos e detalhes abaixo do vídeo */}
                    <div className="p-8 max-w-6xl mx-auto w-full space-y-4">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {webinar?.publicTitle || "Aula ao Vivo"}
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed">
                            {webinar?.internalTitle}
                        </p>
                        
                        {/* Selo de Ao Vivo */}
                        {status === 'live' && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                                <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Ao Vivo</span>
                            </div>
                        )}
                    </div>
                 </main>

                 {/* LADO DIREITO: CHAT */}
                 <aside className="w-full lg:w-100 bg-white border-l border-white/10 flex flex-col h-125 lg:h-auto shrink-0">
                     {/* Só renderiza o chat se a sessão estiver definida, para garantir o filtro de mensagens */}
                     {currentSessionStart && (
                        <WebinarChat webinarId={id} sessionStart={currentSessionStart} />
                     )}
                 </aside>

             </div>
        </div>
    );
}

/**
 * Componente do Player do Panda Video
 * @param {string} videoId - ID do vídeo no Panda
 * @param {number} startTime - Segundo onde o vídeo deve começar
 */
function FakeLivePlayer({ videoId, startTime }) {
  const pandaUrl = `https://player-vz-7023366c-48c.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false`;

  return (
    <div className="relative w-full h-full bg-black">
      <iframe 
        src={pandaUrl} 
        className="absolute top-0 left-0 w-full h-full" 
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" 
        allowFullScreen={true} 
        style={{ border: 'none' }}
        referrerPolicy="origin" 
      ></iframe>
      <div className="absolute inset-0 z-10 bg-transparent cursor-default"></div> 
    </div>
  );
}