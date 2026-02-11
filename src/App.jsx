import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { WebinarConfig } from './pages/Webnar/WebinarConfig'; 
import WebinarSchedule from './pages/Webnar/WebinarSchedule';
import WebinarRegistration from './pages/Webnar/WebinarRegistration';
import { WebinarRoom } from './pages/Webnar/WebinarRoom'; 
// 1. IMPORTAR O FINISH
import WebinarFinish from './pages/Webnar/WebinarFinish';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Fluxo de Criação */}
        <Route path="/webinars/new" element={<WebinarConfig />} />
        <Route path="/webinars/config" element={<WebinarConfig />} />
        <Route path="/webinars/schedule" element={<WebinarSchedule />} />
        <Route path="/webinars/registration" element={<WebinarRegistration />} />
        
        {/* 2. NOVA ROTA DE FINALIZAÇÃO */}
        <Route path="/webinars/finish" element={<WebinarFinish />} />
        
        {/* Sala ao Vivo (Fake Live) */}
        <Route path="/live/:id" element={<WebinarRoom />} />
      </Routes>
    </Router>
  );
}

export default App;