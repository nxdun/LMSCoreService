const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Your name is required"],
    },
    learnerId: {  // Corrected the field name here
      type: String,
    },
    email: {
      type: String,
      required: [true, "Your email is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    // Updating the reply field to accommodate multiple replies and not be required initially
    replies: [{
      type: {
        message: String,
        repliedBy: String,
        replyDate: {
          type: Date,
          default: Date.now
        }
      },
      required: false,
    }],
    state: {
      type: String,
      required: [true, "State is required"],
      default: 'open' // Default state for new tickets
    }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
