import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { WebinarConfig } from './pages/Webnar/WebinarConfig'; 
import WebinarSchedule from './pages/Webnar/WebinarSchedule';
import WebinarRegistration from './pages/Webnar/WebinarRegistration';
import { WebinarRoom } from './pages/Webnar/WebinarRoom'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/webinars/new" element={<WebinarConfig />} />
        <Route path="/webinars/config" element={<WebinarConfig />} />
        <Route path="/webinars/registration" element={<WebinarRegistration />} />
        <Route path="/webinars/schedule" element={<WebinarSchedule />} />
        
        {/* 2. ADICIONAR A ROTA PARA O FAKE LIVE */}
        <Route path="/live/:id" element={<WebinarRoom />} />
      </Routes>
    </Router>
  );
}

export default App;