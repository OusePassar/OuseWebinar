import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { WebinarChat } from '../../components/WebinarChat'; 
import { Header } from '../../components/header';
import { Clock, AlertCircle } from 'lucide-react';

export function WebinarRoom() {
    const { id } = useParams();
    
    // Estados principais
    const [webinar, setWebinar] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, waiting, live, ended
    const [startTime, setStartTime] = useState(0); // Tempo onde o vídeo deve começar (em segundos)
    const [currentSessionStart, setCurrentSessionStart] = useState(null); // Data ISO de início da sessão atual (para o Chat)

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

    // EFEITO 2: O "Motor" do Fake Live
    // Verifica a cada minuto se deve começar a aula ou se já está rodando
    useEffect(() => {
        if (!webinar || !webinar.schedules) return;

        const checkSchedule = () => {
            const now = new Date();
            
            // Encontra o agendamento válido
            // Regra: Considera "ao vivo" entre 10min antes e 120min (2h) depois do início
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
            
            // ATUALIZAÇÃO IMPORTANTE PARA O CHAT:
            // Guardamos o horário de início desta sessão específica.
            // O componente de Chat usará isso para mostrar apenas mensagens NOVAS (desta sessão).
            setCurrentSessionStart(activeSchedule.startDate);

            // Calcula onde o vídeo deve estar agora
            const diffSeconds = (now - scheduleDate) / 1000;

            if (diffSeconds < 0) {
                // Se diffSeconds for negativo, a aula é no futuro próximo (ex: faltam 5 min)
                setStatus('waiting'); 
            } else {
                // A aula já começou, calcula o segundo exato para sincronizar
                setStartTime(Math.floor(diffSeconds));
                setStatus('live');
            }
        };

        // Roda a verificação imediatamente ao carregar
        checkSchedule();

        // Configura um intervalo para checar a cada 60s (para transição automática de Waiting -> Live)
        const interval = setInterval(checkSchedule, 60000);

        return () => clearInterval(interval);
    }, [webinar]);

    // --- RENDERIZAÇÃO CONDICIONAL (Loading / Error) ---

    if (status === 'loading') return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jam-blue"></div>
        </div>
    );

    if (status === 'error') return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center text-white flex-col gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <h1 className="text-2xl font-bold">Webinar não encontrado</h1>
            <p className="text-white/50">Verifique o link e tente novamente.</p>
        </div>
    );

    // --- LAYOUT PRINCIPAL DA SALA ---
    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col font-sans overflow-hidden">
             {/* Header Fixo */}
             <div className="border-b border-white/10 shrink-0">
                 <Header /> 
             </div>

             {/* Container Flex: Vídeo (Esq) + Chat (Dir) */}
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
                 
                 {/* ÁREA PRINCIPAL (VÍDEO + INFO) */}
                 <main className="flex-1 bg-black flex flex-col relative overflow-y-auto custom-scrollbar">
                    
                    {/* Player Wrapper (Mantém aspect ratio 16:9) */}
                    <div className="w-full bg-black aspect-video relative flex items-center justify-center shadow-2xl z-10 border-b border-white/5">
                        {status === 'waiting' ? (
                            // Tela de Espera
                            <div className="flex flex-col items-center justify-center text-white p-8 animate-fade-in text-center">
                                <div className="bg-white/5 p-6 rounded-full mb-6 ring-1 ring-white/10">
                                    <Clock size={48} className="text-jam-blue animate-pulse" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2 tracking-tight">A aula começará em breve</h1>
                                <p className="text-white/50 text-lg">Aguarde, a transmissão iniciará automaticamente.</p>
                                
                                {webinar?.schedules?.[0] && (
                                    <div className="mt-8 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-sm">
                                        Próxima sessão: {webinar.schedules[0].displayDate} às {webinar.schedules[0].displayTime}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Player do Panda (Sincronizado)
                            <FakeLivePlayer videoId={webinar.videoId} startTime={startTime} />
                        )}
                    </div>

                    {/* Informações Abaixo do Vídeo */}
                    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/10 pb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {webinar?.publicTitle || "Título do Webinar"}
                                </h1>
                                <p className="text-white/60 text-lg max-w-2xl">
                                    {webinar?.internalTitle || "Descrição do evento ao vivo."}
                                </p>
                            </div>
                            
                            {/* Botão de CTA (Aparece só quando 'live') */}
                            {status === 'live' && (
                                <button className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all active:scale-95 animate-bounce-slow whitespace-nowrap">
                                    QUERO APROVEITAR A OFERTA
                                </button>
                            )}
                        </div>

                        {/* Conteúdo Extra / Bio / Avisos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white/50 text-sm">
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-white font-bold text-lg">Sobre esta aula</h3>
                                <p className="leading-relaxed">
                                    Bem-vindo à transmissão oficial. Utilize o chat à direita para interagir com nossa equipe e outros alunos. 
                                    O conteúdo apresentado aqui é exclusivo e não ficará gravado.
                                </p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-yellow-500"/> Importante
                                </h4>
                                <p>Não compartilhe dados pessoais no chat. Mantenha o respeito com os colegas.</p>
                            </div>
                        </div>
                    </div>
                 </main>

                 {/* SIDEBAR DO CHAT */}
                 <aside className="w-full lg:w-100 bg-white border-l border-white/10 flex flex-col h-125 lg:h-auto z-20 shadow-xl shrink-0">
                     {/* Só carrega o chat se tivermos a data de início da sessão (para filtrar msg antiga) */}
                     {currentSessionStart ? (
                         <WebinarChat webinarId={id} sessionStart={currentSessionStart} />
                     ) : (
                         <div className="flex items-center justify-center h-full text-gray-400">
                             Conectando ao chat...
                         </div>
                     )}
                 </aside>

             </div>
        </div>
    );
}

// --- COMPONENTE PLAYER AUXILIAR ---
function FakeLivePlayer({ videoId, startTime }) {
  // Parâmetros do Panda:
  // currentTime: Pula o vídeo para X segundos
  // autoplay: Inicia sozinho
  // controls=false: Esconde a barra de progresso (sensação de live)
  const pandaUrl = `https://player-vz-7023366c-48c.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false`;

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        src={pandaUrl}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={true}
        style={{ border: 'none' }}
      ></iframe>
      {/* Camada transparente para bloquear cliques/pausa (opcional) */}
      <div className="absolute inset-0 z-10 bg-transparent"></div> 
    </div>
  );
}