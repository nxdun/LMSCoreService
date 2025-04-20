// src/components/ReplyForm.js
import React, { useState } from 'react';

const ReplyForm = ({ ticketId, onAddReply, isAdmin }) => {
  const [message, setMessage] = useState('');
  const [repliedBy, setRepliedBy] = useState(isAdmin ? 'Support Staff' : 'Customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Reply message cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onAddReply(ticketId, { message, repliedBy });
      setMessage('');
    } catch (err) {
      setError('Failed to add reply. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Add Reply</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Type your reply here..."
            required
          ></textarea>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <label className="block mb-1">Reply as</label>
            <input
              type="text"
              value={repliedBy}
              onChange={(e) => setRepliedBy(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;