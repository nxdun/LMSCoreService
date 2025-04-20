// src/components/TicketList.js
import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TicketList = ({ tickets, onDelete }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Subject</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Created</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{ticket._id.substring(0, 8)}...</td>
              <td className="py-3 px-4 font-medium">
                <Link to={`/tickets/${ticket._id}`} className="text-blue-600 hover:underline">
                  {ticket.subject}
                </Link>
              </td>
              <td className="py-3 px-4">{ticket.category}</td>
              <td className="py-3 px-4">
                <StatusBadge status={ticket.state} />
              </td>
              <td className="py-3 px-4">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 flex space-x-2">
                <Link 
                  to={`/tickets/${ticket.learnerId}`} 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View
                </Link>
                <button 
                  onClick={() => onDelete(ticket._id)} 
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;