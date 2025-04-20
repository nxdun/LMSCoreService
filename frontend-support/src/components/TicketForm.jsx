// src/components/TicketForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TicketForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    learnerId: '',
    category: '',
    subject: '',
    message: '',
  });

  const categories = [
    'Technical Issue',
    'Course Content',
    'Billing',
    'Account Access',
    'Feature Request',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Add state field with default value "open"
      const ticketData = { ...formData, state: 'open' };
      await api.createTicket(ticketData);
      navigate('/tickets/my-tickets', { 
        state: { message: 'Ticket created successfully!' } 
      });
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block mb-1">Learner ID (optional)</label>
          <input
            type="text"
            name="learnerId"
            value={formData.learnerId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;