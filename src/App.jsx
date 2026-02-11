import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { WebinarConfig } from './pages/Webnar/WebinarConfig'; 
import WebinarSchedule from './pages/Webnar/WebinarSchedule';
import WebinarRegistration from './pages/Webnar/WebinarRegistration';
import { WebinarRoom } from './pages/Webnar/WebinarRoom'; 
import WebinarFinish from './pages/Webnar/WebinarFinish';

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Principal */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Fluxo de Configuração do Webinar */}
        <Route path="/webinars/new" element={<WebinarConfig />} />
        <Route path="/webinars/config" element={<WebinarConfig />} />
        <Route path="/webinars/schedule" element={<WebinarSchedule />} />
        <Route path="/webinars/registration" element={<WebinarRegistration />} />
        <Route path="/webinars/finish" element={<WebinarFinish />} />
        
        {/* Sala de Transmissão (Fake Live) */}
        {/* O :id é obrigatório para o Firebase localizar o webinar correto */}
        <Route path="/live/:id" element={<WebinarRoom />} />
      </Routes>
    </Router>
  );
}

export default App;