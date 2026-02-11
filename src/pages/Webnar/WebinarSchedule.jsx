import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { StepItem } from '../../components/StepItem';
import { 
  Settings, 
  Calendar, 
  ClipboardList, 
  CheckCircle2, 
  Plus, 
  X, 
  Pencil, 
  Info, 
  ChevronLeft 
} from 'lucide-react';

export default function WebinarSchedule() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([
    { id: 1, date: '2025-12-23', time: '07:00 PM' }
  ]);

  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('12:00 PM');

  const addSchedule = () => {
    if (!inputDate) {
      alert("Por favor, selecione uma data válida.");
      return;
    }
    const newSession = { id: Date.now(), date: inputDate, time: inputTime };
    setSchedules([...schedules, newSession]);
    setInputDate('');
  };

  const removeSchedule = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    // Alterado: bg-app-bg e text-app-text para responder ao tema
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">
      <Header />
      
      <main className="max-w-5xl mx-auto p-8 pt-10">
        
        <div className="flex justify-center items-center gap-12 mb-12 border-b border-white/5 pb-10">
          <StepItem to="/webinars/config" icon={<Settings size={18}/>} label="Configuration" completed active />
          <StepItem to="/webinars/schedule" icon={<Calendar size={18}/>} label="Schedules" active />
          <StepItem to="/webinars/registration" icon={<ClipboardList size={18}/>} label="Registration" />
          <StepItem to="/webinars/finish" icon={<CheckCircle2 size={18}/>} label="Finish" />
        </div>

        <button 
          onClick={() => navigate('/webinars/config')} 
          className="flex items-center gap-2 opacity-60 hover:opacity-100 mb-8 transition-all text-sm uppercase font-black tracking-widest"
        >
          <ChevronLeft size={20} /> Back to Configuration
        </button>

        {/* Alterado: bg-app-card para responder ao tema */}
        <div className="bg-app-card rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-colors duration-300">
          
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/5">
            <h2 className="text-xl font-medium italic">Webinar schedules</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="px-5 py-2 rounded-md bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all border border-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate('/webinars/registration')}
                className="px-5 py-2 rounded-md bg-jam-blue text-white font-bold hover:bg-blue-600 text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Save & Next
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Input de nova série ajustado para temas */}
            <div className="bg-black/10 p-6 rounded-xl border border-white/5 flex flex-wrap lg:flex-nowrap gap-6 items-end">
              <div className="flex-none">
                <div className="bg-jam-blue text-white text-[10px] font-black px-2 py-1 rounded mb-2 w-fit tracking-tighter italic">NEW SERIES</div>
                <select className="bg-app-bg border border-white/10 p-2.5 rounded text-sm outline-none focus:border-jam-blue w-32">
                  <option>On</option>
                  <option>Every</option>
                </select>
              </div>

              <div className="flex-1 min-w-35">
                <label className="text-[10px] font-black uppercase opacity-40 mb-2 block tracking-[0.2em] text-left">Data</label>
                <input 
                  type="date" 
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full bg-app-bg border border-white/10 p-2.5 rounded text-sm outline-none focus:border-jam-blue" 
                />
              </div>

              <div className="flex-1 min-w-30">
                <label className="text-[10px] font-black uppercase opacity-40 mb-2 block tracking-[0.2em] text-left">Horário</label>
                <input 
                  type="text" 
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  placeholder="12:00 PM"
                  className="w-full bg-app-bg border border-white/10 p-2.5 rounded text-sm outline-none focus:border-jam-blue" 
                />
              </div>

              <button 
                onClick={addSchedule}
                className="bg-transparent border border-jam-blue text-jam-blue px-8 py-2.5 rounded font-black uppercase text-xs tracking-widest hover:bg-jam-blue hover:text-white transition-all active:scale-95"
              >
                Add
              </button>
            </div>

            <div className="space-y-3">
              {schedules.map(s => (
                <div key={s.id} className="bg-white/5 p-5 rounded-xl flex justify-between items-center border border-white/5 group hover:border-jam-blue/30 transition-all">
                  <div className="flex items-center gap-6 text-left">
                    <div className="bg-jam-blue/10 text-jam-blue text-[10px] font-black px-2 py-1 rounded border border-jam-blue/20 italic tracking-tighter">1 SERIES</div>
                    <div className="text-sm font-bold tracking-tight italic opacity-80">On {s.date} at {s.time}</div>
                  </div>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 hover:bg-jam-blue/10 rounded-lg text-jam-blue"><Pencil size={16}/></button>
                    <button onClick={() => removeSchedule(s.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 space-y-6 border-t border-white/5">
              <ToggleSwitch 
                title="Enable instant watch replay" 
                description="Watch the replay now option on registration page." 
              />
              <ToggleSwitch 
                title="Allow late attendance" 
                description="Let people join an already-running webinar." 
                initialState={true} 
              />
            </div>
          </div>

          <div className="p-10 flex justify-center gap-6 bg-black/5 border-t border-white/5">
            <button 
              onClick={() => navigate('/webinars/config')} 
              className="px-14 py-3 rounded-md bg-transparent border border-jam-blue/30 text-jam-blue font-black uppercase text-xs tracking-[0.2em] hover:bg-white/5 transition-all"
            >
              Back
            </button>
            <button 
              onClick={() => navigate('/webinars/registration')} 
              className="px-14 py-3 rounded-md bg-jam-blue text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
            >
              Next Step
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ToggleSwitch({ title, description, initialState = false }) {
  const [enabled, setEnabled] = useState(initialState);
  return (
    <div className="flex justify-between items-start gap-12 group cursor-pointer" onClick={() => setEnabled(!enabled)}>
      <div className="flex-1 text-left">
        <h4 className={`font-bold text-sm mb-1 transition-colors ${enabled ? 'text-jam-blue' : 'opacity-60'}`}>{title}</h4>
        <p className="text-xs opacity-40 leading-relaxed max-w-2xl text-left">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${enabled ? 'bg-jam-blue' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}