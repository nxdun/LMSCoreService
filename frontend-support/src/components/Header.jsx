// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-200">LMS Support Desk</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-gray-200">Dashboard</Link></li>
            <li><Link to="/tickets/new" className="hover:text-gray-200">Create Ticket</Link></li>
            <li><Link to="/tickets/my-tickets" className="hover:text-gray-200">My Tickets</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;