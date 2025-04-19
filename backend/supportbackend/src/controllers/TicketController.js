const Ticket = require("../models/TicketModel");
const axios = require("axios"); // Make sure axios is installed

// Email service configuration
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || "http://localhost:8076";

// Helper function to send emails through the email service
const sendEmail = async (to, subject, text) => {
  try {
    const response = await axios.post(`${EMAIL_SERVICE_URL}/api/send-email`, {
      to,
      subject,
      text
    });
    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    throw error;
  }
};

// Create a new Ticket
const createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    
    // Send confirmation email
    try {
      await sendEmail(
        ticket.email, 
        'Support Ticket Created - #' + ticket._id,
        `Your ticket with subject '${ticket.subject}' has been submitted successfully.
        
Ticket Details:
ID: ${ticket._id}
Subject: ${ticket.subject}
Status: ${ticket.state}

We will get back to you as soon as possible.
Thank you for contacting support.`
      );
      
      // Also notify support team
      await sendEmail(
        'support@yourlms.com', // Support team email
        'New Support Ticket - #' + ticket._id,
        `A new support ticket has been created:
        
Ticket ID: ${ticket._id}
User: ${ticket.name} (${ticket.email})
Subject: ${ticket.subject}
Message: ${ticket.message}

Please respond to this ticket as soon as possible.`
      );
    } catch (emailError) {
      // Log the error but don't fail the ticket creation
      console.error("Failed to send notification email:", emailError);
    }

    res.status(201).send(ticket);
  } catch (error) {
    console.error("Error while creating ticket:", error);
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
    
    // Send email notification about deletion
    try {
      await sendEmail(
        ticket.email,
        'Support Ticket Removed - #' + ticket._id,
        `Your ticket with subject '${ticket.subject}' has been removed from our system.
        
If you believe this was done in error, please create a new support ticket.
Thank you for your understanding.`
      );
    } catch (emailError) {
      console.error("Failed to send ticket deletion email:", emailError);
    }
    
    res.status(200).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Function to mark a ticket as resolved
const resolveTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { state: "resolved" },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }
    
    // Send resolution notification
    try {
      await sendEmail(
        ticket.email,
        'Support Ticket Resolved - #' + ticket._id,
        `Your support ticket with subject '${ticket.subject}' has been resolved.
        
We hope that your issue has been addressed satisfactorily.
If you have any further questions, feel free to reply to this email or create a new ticket.

Thank you for your patience!
LMS Support Team`
      );
    } catch (emailError) {
      console.error("Failed to send ticket resolution email:", emailError);
    }
    
    res.status(200).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Function to add a reply to a ticket
const addReplyToTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { message, repliedBy } = req.body;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }

    // Adding a new reply to the 'replies' array
    ticket.replies.push({ message, repliedBy });
    await ticket.save();
    
    // Send notification about the new reply
    try {
      // Determine who to notify based on who replied
      const isStaffReply = repliedBy.toLowerCase().includes('staff') || 
                          repliedBy.toLowerCase().includes('admin') ||
                          repliedBy.toLowerCase().includes('support');
      
      if (isStaffReply) {
        // Staff replied, notify the customer
        await sendEmail(
          ticket.email,
          'New Reply to Your Support Ticket - #' + ticket._id,
          `Hello ${ticket.name},

Our support team has responded to your ticket regarding "${ticket.subject}".

Reply from ${repliedBy}:
${message}

You can respond to this email or log in to your account to view the full conversation.

Thank you,
LMS Support Team`
        );
      } else {
        // Customer replied, notify support staff
        await sendEmail(
          'support@yourlms.com',
          'Customer Reply to Ticket - #' + ticket._id,
          `A customer has responded to ticket #${ticket._id}:

Customer: ${ticket.name} (${ticket.email})
Subject: ${ticket.subject}
Reply: ${message}

Please review and respond as needed.`
        );
      }
    } catch (emailError) {
      console.error("Failed to send reply notification email:", emailError);
    }
    
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
