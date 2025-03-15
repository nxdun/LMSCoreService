const express = require('express');
const TicketRouter = express.Router();
const {
    createTicket,
    getAllTickets,
    getTicketById,
    deleteTicket,
    addReplyToTicket,
    resolveTicket
} = require('../controllers/TicketController'); // Ensure this path is correct

// Route to create a new ticket
TicketRouter.post('/tickets', createTicket);

// Route to retrieve all tickets
TicketRouter.get('/tickets', getAllTickets);

// Route to retrieve a specific ticket by ID
TicketRouter.get('/tickets/:learnerId', getTicketById);

// Route to delete a specific ticket by ID
TicketRouter.delete('/tickets/:id', deleteTicket);

TicketRouter.post('/tickets/:ticketId/replies', addReplyToTicket);

// Route to mark a ticket as resolved
TicketRouter.patch('/tickets/:ticketId/resolve', resolveTicket);


module.exports = TicketRouter;
