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
    const [startTime, setStartTime] = useState(null); // Iniciamos como null para saber que ainda não calculamos
    const [currentSessionStart, setCurrentSessionStart] = useState(null);

    // Função de cálculo isolada para ser chamada no carregamento e no intervalo
    const checkSchedule = useCallback((data) => {
        if (!data || !data.schedules) return;

        const now = new Date();
        const activeSchedule = data.schedules.find(s => {
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

        const diffSeconds = (now - scheduleDate) / 1000;

        if (diffSeconds < 0) {
            setStatus('waiting');
        } else {
            // Sincronização Absoluta
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
                    // IMPORTANTE: Calcula o tempo IMEDIATAMENTE após receber os dados
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

    // Intervalo de atualização (apenas para mudar de 'waiting' para 'live' sem F5)
    useEffect(() => {
        if (status === 'loading') return;
        const interval = setInterval(() => checkSchedule(webinar), 30000);
        return () => clearInterval(interval);
    }, [webinar, status, checkSchedule]);

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
                            /* SÓ RENDERIZA SE TIVERMOS O STARTTIME CALCULADO */
                            startTime !== null && <FakeLivePlayer videoId={webinar.videoId} startTime={startTime} />
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
  // Adicionamos o startTime na URL e na Key
  const pandaUrl = `https://player-vz-69adbbef-538.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false&video_id=${videoId}&t=${startTime}`;

  return (
    <div className="relative w-full h-full bg-black">
      <iframe 
        key={startTime} 
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