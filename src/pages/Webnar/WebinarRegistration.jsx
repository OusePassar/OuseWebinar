import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Settings, 
  Calendar, 
  ClipboardList, 
  CheckCircle2, 
  ChevronLeft, 
  Pencil, 
  Plus, 
  X, 
  GripVertical, 
  AlertTriangle 
} from 'lucide-react';
import { StepItem } from '../../components/StepItem';

// Lista de campos disponíveis para adicionar
const AVAILABLE_OPTS = [
  { id: 'last_name', label: 'Last name' },
  { id: 'phone', label: 'Phone number' },
  { id: 'country', label: 'Country' },
  { id: 'state', label: 'State / Province' },
];

export default function WebinarRegistration() {
  const navigate = useNavigate();
  const webinarId = localStorage.getItem('currentWebinarId');
  const [openSection, setOpenSection] = useState('fields');
  
  // Estado dos campos ativos (começa com o básico)
  const [activeFields, setActiveFields] = useState([
    { id: 'first_name', label: 'First name', mandatory: true, fixed: true },
    { id: 'email', label: 'Email address', mandatory: true, fixed: true }
  ]);

  // 1. Carregar dados do Firebase ao iniciar
  useEffect(() => {
    const loadFields = async () => {
      if (!webinarId) return;
      try {
        const docRef = doc(db, "webinars", webinarId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.registrationFields && data.registrationFields.length > 0) {
            setActiveFields(data.registrationFields);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar campos:", error);
      }
    };
    loadFields();
  }, [webinarId]);

  // Adicionar campo da lista da esquerda para a direita
  const handleAddField = (fieldOpt) => {
    // Verifica se já existe
    if (activeFields.find(f => f.id === fieldOpt.id)) return;
    
    setActiveFields([...activeFields, { 
      ...fieldOpt, 
      mandatory: false, 
      fixed: false 
    }]);
  };

  // Remover campo
  const handleRemoveField = (id) => {
    setActiveFields(activeFields.filter(f => f.id !== id));
  };

  // Alternar se é obrigatório
  const handleToggleMandatory = (id) => {
    setActiveFields(activeFields.map(f => {
      if (f.id === id) return { ...f, mandatory: !f.mandatory };
      return f;
    }));
  };

  // Salvar no Firebase
  const handleSave = async (redirect = false) => {
    if (!webinarId) return;
    try {
      const docRef = doc(db, "webinars", webinarId);
      await updateDoc(docRef, {
        registrationFields: activeFields
      });
      
      if (redirect) {
        navigate('/webinars/finish');
      } else {
        alert("Campos salvos com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações.");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">
      <Header />
      
      <main className="max-w-5xl mx-auto p-8 pt-10">
        {/* NAVEGAÇÃO SUPERIOR */}
        <div className="flex justify-center items-center gap-12 mb-12 border-b border-white/5 pb-10">
          <StepItem to="/webinars/config" icon={<Settings size={18}/>} label="Configuration" completed active />
          <StepItem to="/webinars/schedule" icon={<Calendar size={18}/>} label="Schedules" completed active />
          <StepItem to="/webinars/registration" icon={<ClipboardList size={18}/>} label="Registration" active completed={false} />
          <StepItem to="/webinars/finish" icon={<CheckCircle2 size={18}/>} label="Finish" />
        </div>

        <button 
          onClick={() => navigate('/webinars/schedule')} 
          className="flex items-center gap-2 opacity-60 hover:opacity-100 mb-8 transition-all text-sm uppercase font-black tracking-widest"
        >
          <ChevronLeft size={20} /> Back to Schedules
        </button>

        <div className="space-y-4">
          
          {/* ÚNICA SEÇÃO: CAMPOS DO FORMULÁRIO */}
          <ConfigAccordion 
            title="Registration form fields" 
            summary={`${activeFields.length} fields configured`}
            isOpen={openSection === 'fields'}
            onOpen={() => setOpenSection('fields')}
          >
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Coluna Esquerda: Add Fields */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-4 text-left">Add fields</h4>
                  
                  {/* Renderiza sempre o First Name e Email como desabilitados (fixos) */}
                  <FieldOption label="First name" disabled={true} />
                  <FieldOption label="Email address" disabled={true} />

                  {/* Renderiza as opções dinâmicas */}
                  {AVAILABLE_OPTS.map(opt => {
                    const isAdded = activeFields.some(f => f.id === opt.id);
                    return (
                      <FieldOption 
                        key={opt.id} 
                        label={opt.label} 
                        disabled={isAdded} 
                        onClick={() => !isAdded && handleAddField(opt)}
                      />
                    );
                  })}
                </div>

                {/* Coluna Direita: Form Fields & Mandatory */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-40 tracking-widest mb-4">
                    <span>Form fields</span>
                    <span>Mandatory</span>
                  </div>
                  
                  {activeFields.map((field) => (
                    <ActiveField 
                      key={field.id}
                      field={field}
                      onRemove={() => handleRemoveField(field.id)}
                      onToggle={() => handleToggleMandatory(field.id)}
                    />
                  ))}

                  {/* Alerta de Compliance (Só aparece se tiver Country ou State) */}
                  {activeFields.some(f => f.id === 'country' || f.id === 'state') && (
                    <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-4 animate-fade-in">
                      <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                      <div className="text-left">
                        <h5 className="text-yellow-500 font-bold text-xs mb-1">Compliance Notice</h5>
                        <p className="text-[10px] text-yellow-500/70 leading-relaxed">
                          Ensure your data collection complies with local regulations when asking for location data.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-white/10">
                <button onClick={() => navigate('/webinars/schedule')} className="px-6 py-2 rounded-md font-bold hover:bg-black/10 text-xs uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => handleSave(false)} className="bg-jam-blue px-6 py-2 rounded-md font-bold text-white shadow-lg text-xs uppercase tracking-widest active:scale-95 transition-all">Save</button>
              </div>
            </div>
          </ConfigAccordion>

        </div>

        <div className="mt-12 flex justify-center gap-6">
          <button 
            onClick={() => navigate('/webinars/schedule')}
            className="px-14 py-4 rounded-xl bg-transparent border border-jam-blue/30 text-jam-blue font-black uppercase text-xs tracking-[0.2em] hover:bg-black/5 transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => handleSave(true)}
            className="bg-jam-blue text-white px-14 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
          >
            Next Step
          </button>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ATUALIZADOS ---

function FieldOption({ label, disabled = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex justify-between items-center p-3 bg-black/5 border border-white/5 rounded-lg transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-jam-blue/30 cursor-pointer hover:bg-white/5'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <Plus size={18} className={disabled ? 'text-white/20' : 'text-jam-blue'} />
    </div>
  );
}

function ActiveField({ field, onRemove, onToggle }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="flex-1 flex items-center gap-3 p-3 bg-black/5 border border-white/5 rounded-lg group-hover:border-white/10 transition-colors">
        <GripVertical size={16} className="opacity-20 cursor-move" />
        <span className="text-sm opacity-80 flex-1 text-left">{field.label}</span>
        
        {/* Só mostra o X se não for fixo (First Name e Email não podem ser removidos) */}
        {!field.fixed && (
            <button onClick={onRemove} className="opacity-40 hover:opacity-100 hover:text-red-500 transition-colors p-1">
                <X size={16} />
            </button>
        )}
      </div>
      
      <button 
        onClick={onToggle}
        disabled={field.fixed} // First Name e Email são sempre obrigatórios? Se sim, desabilita toggle.
        className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${field.mandatory ? 'bg-jam-blue' : 'bg-white/10'} ${field.fixed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${field.mandatory ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ConfigAccordion({ title, summary, isOpen, onOpen, children }) {
  return (
    <div className={`bg-app-card rounded-xl border transition-all duration-300 ${isOpen ? 'border-jam-blue/40 shadow-2xl' : 'border-white/10'}`}>
      <div onClick={onOpen} className="p-6 flex justify-between items-center cursor-pointer group">
        <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-jam-blue' : 'group-hover:text-app-text'}`}>{title}</h3>
        {!isOpen && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-40 font-medium italic">{summary}</span>
            <div className="p-2 bg-black/5 rounded-full group-hover:bg-black/10 transition-all"><Pencil size={16} /></div>
          </div>
        )}
      </div>
      {isOpen && <div className="border-t border-white/10 bg-black/5">{children}</div>}
    </div>
  );
}