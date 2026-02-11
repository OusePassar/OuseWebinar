import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { WebinarChat } from '../../components/WebinarChat'; 
import { Header } from '../../components/header';
import { Clock, AlertCircle } from 'lucide-react';

export function WebinarRoom() {
    const { id } = useParams();
    const [webinar, setWebinar] = useState(null);
    const [status, setStatus] = useState('loading');
    const [startTime, setStartTime] = useState(0);
    const [currentSessionStart, setCurrentSessionStart] = useState(null);

    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                const docRef = doc(db, "webinars", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setWebinar(docSnap.data());
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error', error);
            }
        };
        fetchWebinar();
    }, [id]);

    useEffect(() => {
        if (!webinar || !webinar.schedules) return;

        const checkSchedule = () => {
            const now = new Date();
            const activeSchedule = webinar.schedules.find(s => {
                const scheduleDate = new Date(s.startDate);
                const diffInMinutes = (now - scheduleDate) / 1000 / 60;
                return diffInMinutes > -10 && diffInMinutes < 120; 
            });

            if (!activeSchedule) {
                setStatus('waiting');
                return;
            }

            setCurrentSessionStart(activeSchedule.startDate);
            const diffSeconds = (now - new Date(activeSchedule.startDate)) / 1000;

            if (diffSeconds < 0) {
                setStatus('waiting');
            } else {
                setStartTime(Math.floor(diffSeconds));
                setStatus('live');
            }
        };

        checkSchedule();
        const interval = setInterval(checkSchedule, 60000);
        return () => clearInterval(interval);
    }, [webinar]);

    if (status === 'loading') return <div className="min-h-screen bg-app-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jam-blue"></div></div>;
    if (status === 'error') return <div className="min-h-screen bg-app-bg flex items-center justify-center text-white flex-col gap-4"><AlertCircle size={48} className="text-red-500" /><h1 className="text-2xl font-bold">Webinar não encontrado</h1></div>;

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex flex-col font-sans overflow-hidden">
             <div className="shrink-0"><Header /></div>
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
                 <main className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    <div className="w-full bg-black aspect-video relative flex items-center justify-center shadow-2xl z-10 border-b border-white/5">
                        {status === 'waiting' ? (
                            <div className="flex flex-col items-center justify-center text-white text-center">
                                <Clock size={48} className="text-jam-blue animate-pulse mb-4" />
                                <h1 className="text-3xl font-bold">A aula começará em breve</h1>
                            </div>
                        ) : (
                            <FakeLivePlayer videoId={webinar.videoId} startTime={startTime} />
                        )}
                    </div>
                    <div className="p-8 max-w-6xl mx-auto w-full">
                        <h1 className="text-3xl font-bold text-white mb-2">{webinar?.publicTitle}</h1>
                        <p className="text-white/60 text-lg">{webinar?.internalTitle}</p>
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
  const pandaUrl = `https://player-vz-7023366c-48c.tv.pandavideo.com.br/embed/?v=${videoId}&currentTime=${startTime}&autoplay=true&controls=false`;
  return (
    <div className="relative w-full h-full bg-black">
      <iframe src={pandaUrl} className="absolute top-0 left-0 w-full h-full" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen={true} style={{ border: 'none' }}></iframe>
      <div className="absolute inset-0 z-10 bg-transparent"></div> 
    </div>
  );
}