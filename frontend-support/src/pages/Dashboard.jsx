// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketList from '../components/TicketList';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api.getAllTickets();
        setTickets(data);
      } catch (err) {
        setError('Failed to fetch tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleDeleteTicket = async (ticketId) => {
    setConfirmDelete(ticketId);
  };

  const confirmDeleteTicket = async () => {
    if (!confirmDelete) return;
    
    try {
      await api.deleteTicket(confirmDelete);
      setTickets(tickets.filter(ticket => ticket._id !== confirmDelete));
    } catch (err) {
      setError('Failed to delete ticket');
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Tickets</h2>
            <div className="text-sm text-gray-600">
              Total: {tickets.length} tickets
            </div>
          </div>
        </div>
        
        <TicketList tickets={tickets} onDelete={handleDeleteTicket} />
      </div>
      
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

export default Dashboard;