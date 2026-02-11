import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
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

export default function WebinarRegistration() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('fields');

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">
      <Header />
      
      <main className="max-w-5xl mx-auto p-8 pt-10">
        {/* NAVEGAÇÃO SUPERIOR PADRONIZADA COM REDIRECIONAMENTO */}
        <div className="flex justify-center items-center gap-12 mb-12 border-b border-white/5 pb-10">
          <StepItem 
            to="/webinars/config" 
            icon={<Settings size={18}/>} 
            label="Configuration" 
            completed={true} 
            active={true} 
          />
          <StepItem 
            to="/webinars/schedule" 
            icon={<Calendar size={18}/>} 
            label="Schedules" 
            completed={true} 
            active={true} 
          />
          <StepItem 
            to="/webinars/registration" 
            icon={<ClipboardList size={18}/>} 
            label="Registration" 
            active={true} 
            completed={false}
          />
          <StepItem 
            to="/webinars/finish" 
            icon={<CheckCircle2 size={18}/>} 
            label="Finish" 
          />
        </div>

        <button 
          onClick={() => navigate('/webinars/schedule')} 
          className="flex items-center gap-2 opacity-60 hover:opacity-100 mb-8 transition-all text-sm uppercase font-black tracking-widest"
        >
          <ChevronLeft size={20} /> Back to Schedules
        </button>

        <div className="space-y-4">
          {/* SEÇÃO 1: DESIGN DA PÁGINA */}
          <ConfigAccordion 
            title="Registration page design" 
            summary="Template 18"
            isOpen={openSection === 'design'}
            onOpen={() => setOpenSection('design')}
          >
            <div className="p-8 text-center opacity-50 italic">Área de seleção de templates...</div>
          </ConfigAccordion>

          {/* SEÇÃO 2: CAMPOS DO FORMULÁRIO */}
          <ConfigAccordion 
            title="Registration form fields" 
            summary="First name, Email, Country, State"
            isOpen={openSection === 'fields'}
            onOpen={() => setOpenSection('fields')}
          >
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Coluna Esquerda: Add Fields */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-4 text-left">Add fields</h4>
                  <FieldOption label="First name" disabled />
                  <FieldOption label="Last name" />
                  <FieldOption label="Email address" disabled />
                  <FieldOption label="Phone number" />
                  <FieldOption label="Country" disabled />
                  <FieldOption label="State" disabled />
                </div>

                {/* Coluna Direita: Form Fields & Mandatory */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase opacity-40 tracking-widest mb-4">
                    <span>Form fields</span>
                    <span>Mandatory</span>
                  </div>
                  
                  <ActiveField label="Enter your first name..." mandatory />
                  <ActiveField label="Enter your email..." mandatory />
                  <ActiveField label="Country" />
                  <ActiveField label="State / Province" />

                  {/* Alerta de Compliance */}
                  <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-4">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                    <div className="text-left">
                      <h5 className="text-yellow-500 font-bold text-xs mb-1">Texas SB 140 Compliance Notice</h5>
                      <p className="text-[10px] text-yellow-500/70 leading-relaxed">
                        The Country and State fields are required to comply with Texas SB 140 regulations for SMS and call notifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-white/10">
                <button className="px-6 py-2 rounded-md font-bold hover:bg-black/10 text-xs uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={() => setOpenSection('')} className="bg-jam-blue px-6 py-2 rounded-md font-bold text-white shadow-lg text-xs uppercase tracking-widest active:scale-95 transition-all">Save</button>
              </div>
            </div>
          </ConfigAccordion>

          <ConfigAccordion title="Free registration vs Paid registration" summary="Free to register" isOpen={false} onOpen={() => {}} />
          <ConfigAccordion title="New registration notification" summary="Disabled" isOpen={false} onOpen={() => {}} />
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <button 
            onClick={() => navigate('/webinars/schedule')}
            className="px-14 py-4 rounded-xl bg-transparent border border-jam-blue/30 text-jam-blue font-black uppercase text-xs tracking-[0.2em] hover:bg-black/5 transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => navigate('/webinars/finish')}
            className="bg-jam-blue text-white px-14 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
          >
            Next Step
          </button>
        </div>
      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
function FieldOption({ label, disabled = false }) {
  return (
    <div className={`flex justify-between items-center p-3 bg-black/5 border border-white/5 rounded-lg transition-all ${disabled ? 'opacity-30' : 'hover:border-jam-blue/30 cursor-pointer'}`}>
      <span className="text-sm font-medium">{label}</span>
      <Plus size={18} className={disabled ? 'cursor-not-allowed' : 'text-jam-blue'} />
    </div>
  );
}

function ActiveField({ label, mandatory = false }) {
  const [isMandatory, setIsMandatory] = useState(mandatory);
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 flex items-center gap-3 p-3 bg-black/5 border border-white/5 rounded-lg">
        <GripVertical size={16} className="opacity-20 cursor-move" />
        <span className="text-sm opacity-60 flex-1 text-left">{label}</span>
        <X size={16} className="opacity-40 hover:text-red-500 cursor-pointer transition-colors" />
      </div>
      <button 
        onClick={() => setIsMandatory(!isMandatory)}
        className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${isMandatory ? 'bg-jam-blue' : 'bg-white/10'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isMandatory ? 'translate-x-5' : 'translate-x-0'}`} />
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