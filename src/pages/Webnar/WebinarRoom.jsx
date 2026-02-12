import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { WebinarChat } from '../../components/WebinarChat'; 
import { HeaderForRoom as Header } from '../../components/headerforRoom';
import { Clock, AlertCircle } from 'lucide-react';

export function WebinarRoom() {
    const { id } = useParams();
    
    const [webinar, setWebinar] = useState(null);
    const [status, setStatus] = useState('loading'); 
    const [startTime, setStartTime] = useState(null); // Trava o player até o cálculo terminar
    const [currentSessionStart, setCurrentSessionStart] = useState(null);

    // FUNÇÃO UNIVERSAL DE SINCRONIZAÇÃO (Garante que Joana e José vejam o mesmo tempo)
    const checkSchedule = useCallback((data) => {
        if (!data || !data.schedules) return;

        const now = new Date();
        const activeSchedule = data.schedules.find(s => {
            const scheduleDate = new Date(s.startDate);
            const diffInMinutes = (now - scheduleDate) / 1000 / 60;
            // Considera live se começou há menos de 2 horas
            return diffInMinutes > -10 && diffInMinutes < 120; 
        });

        if (!activeSchedule) {
            setStatus('waiting');
            return;
        }

        const scheduleDate = new Date(activeSchedule.startDate);
        setCurrentSessionStart(activeSchedule.startDate);

        // CÁLCULO MATEMÁTICO: (Agora - Início do Evento) = Segundo exato da Live
        const diffSeconds = (now - scheduleDate) / 1000;

        if (diffSeconds < 0) {
            setStatus('waiting');
        } else {
            setStartTime(Math.floor(diffSeconds));
            setStatus('live');
        }
    }, []);

    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                const docRef = doc(db, "webinars", id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setWebinar(data);
                    // Calcula o tempo IMEDIATAMENTE após receber dados do Firebase
                    checkSchedule(data); 
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error', error);
            }
        };
        fetchWebinar();
    }, [id, checkSchedule]);

    // Mantém o status atualizado se o aluno estiver na tela de espera
    useEffect(() => {
        if (status === 'loading') return;
        const interval = setInterval(() => checkSchedule(webinar), 30000);
        return () => clearInterval(interval);
    }, [webinar, status, checkSchedule]);

    // Spinner de carregamento (Segura a renderização para não resetar o vídeo no F5)
    if (status === 'loading' || (status === 'live' && startTime === null)) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-white flex-col gap-4">
                <AlertCircle size={48} className="text-red-500" />
                <h1 className="text-2xl font-bold">Webinar não encontrado</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col font-sans overflow-hidden">
             <div className="shrink-0"><Header /></div>
             
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
                 <main className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    <div className="w-full bg-black aspect-video relative flex items-center justify-center shadow-2xl z-10 border-b border-white/5">
                        {status === 'waiting' ? (
                            <div className="flex flex-col items-center justify-center text-white text-center p-6">
                                <Clock size={48} className="text-yellow-500 animate-pulse mb-4" />
                                <h1 className="text-3xl font-bold">A aula começará em breve</h1>
                            </div>
                        ) : (
                            /* O player só é montado quando o startTime é calculado */
                            startTime !== null && (
                                <FakeLivePlayer 
                                    videoId={webinar.videoId} 
                                    startTime={startTime} 
                                    key={`player-${startTime}`} // A KEY força o reset no tempo correto
                                />
                            )
                        )}
                    </div>

                    <div className="p-8 max-w-6xl mx-auto w-full space-y-4">
                        <h1 className="text-3xl font-bold text-white mb-2">{webinar?.publicTitle}</h1>
                        <p className="text-white/60 text-lg leading-relaxed">{webinar?.internalTitle}</p>
                    </div>
                 </main>

                 <aside className="w-full lg:w-[400px] bg-white border-l border-white/10 flex flex-col h-[500px] lg:h-auto shrink-0">
                     {currentSessionStart && <WebinarChat webinarId={id} sessionStart={currentSessionStart} />}
                 </aside>
             </div>
        </div>
    );
}

function FakeLivePlayer({ videoId, startTime }) {
  // URL configurada com o subdomínio correto da sua conta Panda (69adbbef-538)
  const pandaUrl = `https://player-vz-69adbbef-538.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false&video_id=${videoId}`;

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
      {/* Camada invisível para simular Live e impedir que o aluno pule o vídeo */}
      <div className="absolute inset-0 z-10 bg-transparent cursor-default"></div> 
    </div>
  );
}