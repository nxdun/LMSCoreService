// src/pages/UserTickets.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TicketList from '../components/TicketList';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const UserTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [learnerId, setLearnerId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!learnerId.trim()) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const data = await api.getTicketsByLearnerId(learnerId);
      setTickets(data);
      if (data.length === 0) {
        setMessage('No tickets found for this Learner ID.');
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    setConfirmDelete(ticketId);
  };

  const confirmDeleteTicket = async () => {
    if (!confirmDelete) return;
    
    try {
      await api.deleteTicket(confirmDelete);
      setTickets(tickets.filter(ticket => ticket._id !== confirmDelete));
      setMessage('Ticket deleted successfully.');
    } catch (err) {
      setError('Failed to delete ticket');
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <button 
          onClick={() => navigate('/tickets/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Ticket
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Find Your Tickets</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={learnerId}
              onChange={(e) => setLearnerId(e.target.value)}
              placeholder="Enter your Learner ID"
              className="flex-grow border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Tickets'}
            </button>
          </form>
        </div>
      </div>
      
      {tickets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Tickets</h2>
              <div className="text-sm text-gray-600">
                Found: {tickets.length} tickets
              </div>
            </div>
          </div>
          
          <TicketList tickets={tickets} onDelete={handleDeleteTicket} />
        </div>
      )}
      
      <ConfirmModal
        show={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteTicket}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
      />
    </div>
  );
};

export default UserTickets;