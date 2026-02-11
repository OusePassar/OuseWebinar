import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; 

export function WebinarRoom() {
    const { id } = useParams();
    const [webinar, setWebinar] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, waiting, live, ended
    const [startTime, setStartTime] = useState(0);

    // EFEITO 1: Busca os dados do Webinar (roda apenas quando o ID muda)
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
            }
        };
        fetchWebinar();
    }, [id]);

    // EFEITO 2: Verifica o horário (roda quando o webinar carrega e a cada 1 min)
    useEffect(() => {
        // Se não tiver dados ainda, não faz nada
        if (!webinar || !webinar.schedules) return;

        const checkSchedule = () => {
            const now = new Date();
            
            // Encontra o agendamento válido
            const activeSchedule = webinar.schedules.find(s => {
                const scheduleDate = new Date(s.startDate);
                // Calcula a diferença em minutos
                const diffInMinutes = (now - scheduleDate) / 1000 / 60;
                
                // Lógica: É considerado "ao vivo" se estiver entre 10min antes e 120min (2h) depois do início
                return diffInMinutes > -10 && diffInMinutes < 120; 
            });

            if (!activeSchedule) {
                setStatus('waiting');
                return;
            }

            const scheduleDate = new Date(activeSchedule.startDate);
            const diffSeconds = (now - scheduleDate) / 1000;

            if (diffSeconds < 0) {
                setStatus('waiting'); // Está no intervalo de "pré-live" (ex: 5 min antes)
            } else {
                setStartTime(Math.floor(diffSeconds));
                setStatus('live');
            }
        };

        // Roda a verificação imediatamente
        checkSchedule();

        // Configura um intervalo para checar a cada minuto (para virar "live" automaticamente)
        const interval = setInterval(checkSchedule, 60000);

        // Limpa o intervalo se o componente desmontar
        return () => clearInterval(interval);

    }, [webinar]); // Só recria esse efeito se os dados do webinar mudarem

    if (status === 'loading') return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>;
    if (status === 'waiting') return <div className="min-h-screen bg-black text-white flex items-center justify-center">A aula começará em breve...</div>;
    if (status === 'error') return <div className="min-h-screen bg-black text-white flex items-center justify-center">Webinar não encontrado.</div>;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
             {status === 'live' && webinar && (
                 <div className="w-full max-w-6xl">
                    <FakeLivePlayer videoId={webinar.videoId} startTime={startTime} />
                 </div>
             )}
        </div>
    );
}

// Componente Player que aceita o tempo de início
function FakeLivePlayer({ videoId, startTime }) {
  // Monta a URL com o tempo de início (currentTime) e autoplay
  const pandaUrl = `https://player-vz-7023366c-48c.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false`;

  return (
    <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
      <iframe
        src={pandaUrl}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={true}
        style={{ border: 'none' }}
      ></iframe>
      {/* Camada transparente para bloquear a barra de progresso (sensação de ao vivo) */}
      <div className="absolute inset-0 z-10 bg-transparent"></div> 
    </div>
  );
}