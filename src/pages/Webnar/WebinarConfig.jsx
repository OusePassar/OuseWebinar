import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { StepItem } from '../../components/StepItem';
import { Settings, Calendar, ClipboardList, CheckCircle2, ChevronLeft, Pencil, MonitorPlay } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export function WebinarConfig() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('video');
  const [webinarId, setWebinarId] = useState(localStorage.getItem('currentWebinarId') || null);
  
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    videoUrl: '',
    internalTitle: '',
    publicTitle: ''
  });

  // Função para atualizar o estado dos inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- LÓGICA DE EXTRAÇÃO BLINDADA (LINK OU EMBED) ---
  const extractPandaId = (input) => {
    if (!input) return '';
    let cleanInput = input.trim();

    // 0. Detectar e limpar Embed Code (Iframe)
    // Se o usuário colou o código inteiro <iframe src="..."></iframe>
    if (cleanInput.includes('<iframe') || cleanInput.includes('src=')) {
        const srcMatch = cleanInput.match(/src=["'](.*?)["']/);
        if (srcMatch && srcMatch[1]) {
            cleanInput = srcMatch[1]; // Agora temos a URL limpa de dentro do embed
        }
    }

    // 1. Se o usuário colou só o ID (sem link e sem iframe), retorna ele mesmo
    if (!cleanInput.includes('http') && !cleanInput.includes('pandavideo')) {
        return cleanInput;
    }

    try {
        // 2. Tenta processar como URL válida
        const urlObj = new URL(cleanInput);

        // Pega o parâmetro 'v' (ex: ?v=4f08b875...)
        const vParam = urlObj.searchParams.get('v');
        if (vParam) return vParam;

        // Se não tiver ?v=, tenta achar um UUID no meio da URL
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = cleanInput.match(uuidRegex);
        if (match) return match[0];

    } catch (e) {
        console.warn("URL inválida, tentando regex direto no texto:", e);
        // Fallback: Tenta achar UUID mesmo se a string não for uma URL válida
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = cleanInput.match(uuidRegex);
        if (match) return match[0];
    }

    // Fallback final: retorna o texto limpo (provavelmente vai falhar na validação se ainda for URL)
    return cleanInput;
  };

  // Passo 1: Salvar Vídeo
  const handleSaveVideo = async () => {
    const videoId = extractPandaId(formData.videoUrl);
    
    // Validação de segurança
    if (!videoId || videoId.length < 5 || videoId.includes('http') || videoId.includes('<iframe')) {
      alert("ID não identificado! Cole o Link direto ou o código de Embed do Panda.");
      return;
    }

    console.log("ID Extraído com sucesso:", videoId);

    try {
      if (webinarId) {
        // Atualiza existente
        const webinarRef = doc(db, "webinars", webinarId);
        await updateDoc(webinarRef, { videoId: videoId });
        alert("Vídeo ATUALIZADO com sucesso!");
      } else {
        // Cria novo
        const docRef = await addDoc(collection(db, "webinars"), {
          videoId: videoId,
          createdAt: new Date(),
          status: 'draft'
        });
        setWebinarId(docRef.id);
        localStorage.setItem('currentWebinarId', docRef.id);
        alert("Vídeo SALVO com sucesso! ID do Webinar criado.");
      }
      setOpenSection('basic'); // Avança para a próxima seção
    } catch (e) {
      console.error("Erro no Firebase:", e);
      alert("Erro ao salvar no banco de dados. Veja o console (F12).");
    }
  };

  // Passo 2: Salvar Configurações Básicas
  const handleSaveBasic = async () => {
    if (!webinarId) {
        alert("Por favor, confirme o vídeo primeiro (clique no botão Confirmar).");
        return;
    }
    
    try {
      const webinarRef = doc(db, "webinars", webinarId);
      await updateDoc(webinarRef, {
          internalTitle: formData.internalTitle,
          publicTitle: formData.publicTitle
      });
      
      navigate('/webinars/schedule');
    } catch (e) {
      console.error("Erro ao salvar dados básicos: ", e);
      alert("Erro ao salvar dados.");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">
      <Header />

      <main className="max-w-5xl mx-auto p-8 pt-10">

        <div className="flex justify-center items-center gap-12 mb-12 border-b border-white/5 pb-10">
          <StepItem to="/webinars/config" icon={<Settings size={18} />} label="Configuration" active={true} completed={false} />
          <StepItem to="/webinars/schedule" icon={<Calendar size={18} />} label="Schedules" />
          <StepItem to="/webinars/registration" icon={<ClipboardList size={18} />} label="Registration" />
          <StepItem to="/webinars/finish" icon={<CheckCircle2 size={18} />} label="Finish" />
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 opacity-60 hover:opacity-100 mb-8 transition-all text-sm uppercase font-black tracking-widest"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="space-y-4">

          {/* SEÇÃO 1: SOURCE VIDEO */}
          <ConfigAccordion
            title="Source video"
            summary={formData.videoUrl ? `Selected: ${extractPandaId(formData.videoUrl)}` : "External video file"}
            isOpen={openSection === 'video'}
            onOpen={() => setOpenSection('video')}
          >
            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <input type="radio" name="source" className="mt-1.5 accent-jam-blue w-5 h-5" defaultChecked />
                  <div className="text-left">
                    <h4 className="font-bold group-hover:text-jam-blue transition-colors">An external video file</h4>
                    <p className="text-sm opacity-60">Your webinar will play a pre-recorded video file from an external source.</p>
                  </div>
                </label>

                <div className="ml-9 p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase opacity-40 tracking-widest text-left">Video Source URL or Embed Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.videoUrl}
                        onChange={(e) => handleChange('videoUrl', e.target.value)}
                        placeholder="Cole o Link (https://...) ou Embed (<iframe...>)"
                        className="flex-1 bg-app-bg border border-white/10 rounded-lg p-3 outline-none focus:border-jam-blue/50 text-app-text text-sm transition-colors"
                      />
                      <button 
                        onClick={handleSaveVideo}
                        className="bg-white/5 px-4 rounded-lg border border-white/10 text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest hover:text-jam-blue"
                      >
                        Confirm
                      </button>
                    </div>
                    <p className="text-[10px] opacity-30 italic text-left">Suporta links diretos do Panda ou código de Embed (Iframe).</p>
                  </div>

                  {/* Preview Simulado */}
                  <div className="aspect-video bg-black/40 rounded-lg border border-white/5 flex flex-center justify-center items-center relative overflow-hidden group">
                    <MonitorPlay size={48} className="opacity-10 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-jam-blue/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-jam-blue px-3 py-1 rounded shadow-lg">Preview Video</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-4 cursor-pointer group opacity-40 grayscale hover:grayscale-0 transition-all">
                  <input type="radio" name="source" className="mt-1.5 accent-jam-blue w-5 h-5" disabled />
                  <div className="text-left">
                    <h4 className="font-bold group-hover:text-jam-blue transition-colors">A previous session (Import)</h4>
                    <p className="text-sm opacity-60">Import all data from a previous live session (Premium only).</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={handleSaveVideo}
                  className="bg-jam-blue px-10 py-3 rounded-md font-black text-white uppercase text-xs tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </ConfigAccordion>

          {/* SEÇÃO 2: BASIC SETTINGS */}
          <ConfigAccordion
            title="Basic settings"
            summary={formData.publicTitle ? "Configured" : "Not configured"}
            isOpen={openSection === 'basic'}
            onOpen={() => setOpenSection('basic')}
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <InputGroup 
                  label="Webinar name" 
                  placeholder="Workshop - AO VIVO" 
                  hint="Private title." 
                  value={formData.internalTitle}
                  onChange={(e) => handleChange('internalTitle', e.target.value)}
                />
                <InputGroup 
                  label="Webinar title" 
                  placeholder="Aula Secreta da Aprovação" 
                  hint="Public title." 
                  value={formData.publicTitle}
                  onChange={(e) => handleChange('publicTitle', e.target.value)}
                />
              </div>

              <div className="aspect-video bg-black/20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                <MonitorPlay className="opacity-20 transition-opacity group-hover:opacity-40" size={40} />
              </div>

              <div className="col-span-full flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={handleSaveBasic}
                  className="bg-jam-blue px-12 py-3 rounded-md font-black text-white uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all shadow-blue-500/30"
                >
                  Next Step
                </button>
              </div>
            </div>
          </ConfigAccordion>

        </div>
      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
function ConfigAccordion({ title, summary, isOpen, onOpen, children }) {
  return (
    <div className={`bg-app-card rounded-xl border transition-all duration-300 ${isOpen ? 'border-jam-blue/40 shadow-2xl' : 'border-white/10'}`}>
      <div onClick={onOpen} className="p-6 flex justify-between items-center cursor-pointer group">
        <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-jam-blue' : 'group-hover:text-app-text'}`}>{title}</h3>
        {!isOpen && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-40 font-medium italic">{summary}</span>
            <div className="p-2 bg-black/5 rounded-full group-hover:bg-black/10 transition-all text-app-text">
              <Pencil size={16} />
            </div>
          </div>
        )}
      </div>
      {isOpen && <div className="border-t border-white/10 bg-black/5">{children}</div>}
    </div>
  );
}

function InputGroup({ label, placeholder, hint, value, onChange }) {
  return (
    <div className="w-full text-left">
      <label className="block text-[10px] uppercase font-black opacity-40 mb-2 tracking-widest">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-app-bg border border-white/10 rounded-lg p-3 outline-none focus:border-jam-blue/50 text-app-text text-sm transition-colors"
      />
      <p className="text-[10px] mt-1 opacity-30 text-right italic">{hint}</p>
    </div>
  );
}