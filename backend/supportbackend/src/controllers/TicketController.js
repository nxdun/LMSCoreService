const Ticket = require("../models/TicketModel"); // Update the path according to your project structure
const sendEmail=require('../../email-service/util/sendEmail')
// Create a new Ticket
const createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    
    // Assuming `sendEmail` is an async function
    await sendEmail(
      ticket.email, // Assuming `email` field in ticket has the recipient's email
      'Ticket Added',
      `Your ticket with subject '${ticket.subject}' has been submitted.`
    );

    res.status(201).send(ticket);
  } catch (error) {
    console.error("Error while creating ticket or sending email", error);
    res.status(400).send(error);
  }
};


// Retrieve all Tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).send(tickets);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Retrieve a single Ticket by learnerId
const getTicketById = async (req, res) => {
  try {
    console.log("Searching for learnerId:", req.params.learnerId);
    const ticket = await Ticket.find({ learnerId: req.params.learnerId });
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }
    res.status(200).send(ticket);
  } catch (error) {
    console.error("Error in getTicketByLearnerId:", error);
    res.status(500).send(error);
  }
};



// Delete a Ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).send();
    }
    res.status(200).send(ticket);
    await sendEmail(
      ticket.email, // Assuming `email` field in ticket has the recipient's email
      'Ticket removed',
      `Your ticket with subject '${ticket.subject}' has been removed.`
    );

  } catch (error) {
    res.status(500).send(error);
  }
};
// Function to mark a ticket as resolved
const resolveTicket = async (req, res) => {
  const { ticketId } = req.params; // Assuming ticketId is passed as a URL parameter

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { state: "resolved" },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }
    sendEmail(
        ticket.email, // Assuming `email` field in ticket has the recipient's email
        'Ticket Resolved',
        `Your ticket with subject '${ticket.subject}' has been resolved. Thank you for your patience!`
       
    );
    res.status(200).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Function to add a reply to a ticket
const addReplyToTicket = async (req, res) => {
  const { ticketId } = req.params; // Assuming ticketId is passed as a URL parameter
  const { message, repliedBy } = req.body; // Get reply details from request body

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }

    // Adding a new reply to the 'replies' array
    ticket.replies.push({ message, repliedBy });

    await ticket.save();
    res.status(200).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  deleteTicket,
  addReplyToTicket,
    resolveTicket
};
