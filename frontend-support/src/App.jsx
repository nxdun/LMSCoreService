import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import TicketPage from './pages/TicketPage';
import UserTickets from './pages/UserTickets';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets/new" element={<NewTicket />} />
            <Route path="/tickets/:learnerId" element={<TicketPage />} />
            <Route path="/tickets/my-tickets" element={<UserTickets />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
