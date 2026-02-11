import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { WebinarConfig } from './pages/Webnar/WebinarConfig'; 
import WebinarSchedule from './pages/Webnar/WebinarSchedule';
import WebinarRegistration from './pages/Webnar/WebinarRegistration'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota da listagem principal */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Rotas de configuração do Webinar */}
        <Route path="/webinars/new" element={<WebinarConfig />} />
        <Route path="/webinars/config" element={<WebinarConfig />} />
        <Route path="/webinars/registration" element={<WebinarRegistration />} />
        
        {/* Rota da tela de agendamento que criamos por último */}
        <Route path="/webinars/schedule" element={<WebinarSchedule />} />
      </Routes>
    </Router>
  );
}

export default App;