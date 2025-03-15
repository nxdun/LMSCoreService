const paymentAdding= async (req, res) => {
    try {
      const { token } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // Amount in cents
        currency: 'usd',
        payment_method: token,
        confirmation_method: 'manual',
        confirm: true,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error processing payment.' });
    }
  };

module.exports=paymentAdding;
