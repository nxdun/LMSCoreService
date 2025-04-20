// src/pages/NewTicket.js
import React from 'react';
import TicketForm from '../components/TicketForm';

const NewTicket = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Support Ticket</h1>
      <TicketForm />
    </div>
  );
};

export default NewTicket;