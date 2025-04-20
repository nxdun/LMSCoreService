// src/components/TicketDetail.js
import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import ReplyForm from './ReplyForm';
import ConfirmModal from './ConfirmModal';

const TicketDetail = ({ ticket, onResolve, onDelete, onAddReply, isAdmin = false }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  console.log('TicketDetail data received:', ticket);
  
  if (!ticket) {
    return <div style={{color: 'black', padding: '20px', textAlign: 'center'}}>Loading ticket details...</div>;
  }

  // Debug section to show raw data
  const DebugInfo = () => (
    <div style={{margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}>
      <details>
        <summary style={{color: 'black', fontWeight: 'bold', cursor: 'pointer'}}>Debug: View Raw Ticket Data</summary>
        <pre style={{color: 'black', background: '#f0f0f0', padding: '10px', overflow: 'auto'}}>
          {JSON.stringify(ticket, null, 2)}
        </pre>
      </details>
    </div>
  );

  return (
    <div style={{background: '#fff8e6', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
      {/* <DebugInfo />
       */}
      <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827'}}>{ticket.subject}</h2>
          <StatusBadge status={ticket[0].state} />
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px'}}>
          <div>
            <p style={{fontSize: '14px', color: '#4b5563'}}>Submitted by</p>
            <p style={{color: '#111827'}}>{ticket[0].name} ({ticket[0].email})</p>
          </div>
          
          {ticket.learnerId && (
            <div>
              <p style={{fontSize: '14px', color: '#4b5563'}}>Learner ID</p>
              <p style={{color: '#111827'}}>{ticket[0].learnerId}</p>
            </div>
          )}
          
          <div>
            <p style={{fontSize: '14px', color: '#4b5563'}}>Category</p>
            <p style={{color: '#111827'}}>{ticket[0].category}</p>
          </div>
          
          <div>
            <p style={{fontSize: '14px', color: '#4b5563'}}>Created on</p>
            <p style={{color: '#111827'}}>{new Date(ticket[0].createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div style={{marginBottom: '16px'}}>
          <p style={{fontSize: '14px', color: '#4b5563', marginBottom: '8px'}}>Description</p>
          <div style={{padding: '16px', background: '#f9fafb', borderRadius: '8px', whiteSpace: 'pre-line', color: '#111827'}}>
            {ticket[0].message}
          </div>
        </div>
      </div>
      
      {/* Replies section */}
      <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb'}}>
        <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827'}}>Conversation</h3>
        
        {(!ticket.replies || ticket.replies.length === 0) ? (
          <p style={{color: '#6b7280', fontStyle: 'italic'}}>No replies yet.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {ticket.replies.map((reply, index) => {
              const isStaff = reply.repliedBy.toLowerCase().includes('staff') || 
                             reply.repliedBy.toLowerCase().includes('admin') || 
                             reply.repliedBy.toLowerCase().includes('support');
              
              return (
                <div 
                  key={index} 
                  style={{
                    padding: '16px', 
                    borderRadius: '8px',
                    background: isStaff ? '#e6f0ff' : '#f9fafb',
                    marginLeft: isStaff ? '32px' : '0',
                    marginRight: isStaff ? '0' : '32px'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{fontWeight: '500', color: '#111827'}}>{reply.repliedBy}</span>
                    <span style={{fontSize: '14px', color: '#6b7280'}}>
                      {new Date(reply.replyDate).toLocaleString()}
                    </span>
                  </div>
                  <p style={{whiteSpace: 'pre-line', color: '#111827'}}>{reply.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Reply form */}
      <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb'}}>
        <ReplyForm 
          ticketId={ticket._id} 
          onAddReply={onAddReply} 
          isAdmin={isAdmin}
        />
      </div>
      
      {/* Action buttons */}
      <div style={{padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
        {ticket.state !== 'resolved' && (
          <button
            onClick={() => onResolve(ticket._id)}
            style={{
              padding: '8px 16px',
              background: '#16a34a',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Mark as Resolved
          </button>
        )}
        
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Delete Ticket
        </button>
      </div>
      
      {/* Delete confirmation modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(ticket._id);
          setShowDeleteModal(false);
        }}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
      />
    </div>
  );
};

export default TicketDetail;