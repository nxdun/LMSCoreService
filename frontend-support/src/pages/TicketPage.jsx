// src/pages/TicketPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetail from '../components/TicketDetail';
import api from '../services/api';

const TicketPage = () => {
  const { learnerId } = useParams();
  console.log('learnerId', learnerId);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicketsByLearnerId('L1234561234');
        setTicket(data);
        console.log('Ticket data:', data);
      } catch (err) {
        setError('Failed to fetch ticket details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [learnerId]);

  const handleResolveTicket = async (ticketId) => {
    try {
      const updatedTicket = await api.resolveTicket(ticketId);
      setTicket(updatedTicket);
    } catch (err) {
      setError('Failed to resolve ticket');
      console.error(err);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await api.deleteTicket(ticketId);
      navigate('/');
    } catch (err) {
      setError('Failed to delete ticket');
      console.error(err);
    }
  };

  const handleAddReply = async (ticketId, replyData) => {
    try {
      const updatedTicket = await api.addReplyToTicket(ticketId, replyData);
      setTicket(updatedTicket);
    } catch (err) {
      setError('Failed to add reply');
      console.error(err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center text-blue-600 hover:underline"
      >
        ← Back to Tickets
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <TicketDetail 
        ticket={ticket}
        onResolve={handleResolveTicket}
        onDelete={handleDeleteTicket}
        onAddReply={handleAddReply}
        isAdmin={false} // Set based on user role
      />
    </div>
  );
};

export default TicketPage;