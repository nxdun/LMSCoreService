import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'react-router-dom';
import { Button, Typography, Paper } from '@mui/material';

function PaymentPage() {
  const location = useLocation();
  const { courseData } = location.state;
  console.log('Courseid:', courseData._id);

  const makePayment = async () => {
    try {
      const stripe = await loadStripe('pk_test_51PBfN6Rw8nSAo9nW8VB9Pscz74HIE3v3othGtpqNfYzrtXcLImTcgzD3h8DoOPRXDuKkzqSrxq49xvehsL1bGcGL003OHNGvyi');

      const body = {
        products: [
          {
            name: courseData.course_title,
            image: courseData.course_picture,
            price: courseData.price,
            quantity: 1
          }
        ]
      };

      const headers = {
        'Content-Type': 'application/json',
      };
      const apiUrl = import.meta.env.VITE_AUTH_SERVER;
      console.log(`${apiUrl}/checkout`);
      const response = await fetch(`${apiUrl}/checkout`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const session = await response.json();

      // Store courseId in local storage
      localStorage.setItem('courseId', courseData._id);

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  return (
    <Paper
      elevation={3}
      style={{
        padding: '20px',
        maxWidth: '450px',
        height: '500px',
        margin: 'auto',
        marginTop: '50px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        color: 'white',
      }}
    >
      <Typography variant="h4" gutterBottom align="center" color="white">
        Enroll in {courseData.course_title}
      </Typography>
      <Typography variant="h5" gutterBottom align="center" color="white">
        Proceed to Checkout
      </Typography>

      {/* Display course information */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <img
          src={courseData.course_picture}
          alt={courseData.course_title}
          style={{
            width: '300px',
            height: '200px',
            borderRadius: '10px',
            marginTop: '10px',
          }}
        />
        <Typography variant="subtitle1" color="white">
          Name: <strong>{courseData.course_title}</strong>
        </Typography>
        <Typography variant="subtitle1" color="white">
          Course price: <strong>${Number(courseData.price).toFixed(2)}</strong>
        </Typography>
      </div>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={makePayment}
        style={{
          borderRadius: '10px',
          padding: '10px',
          marginTop: '20px',
          backgroundColor: '#11bf20',
          color: '#FFFFFF',
          fontWeight: 'bold',
        }}
        sx={{
          '&:hover': {
            backgroundColor: '#0b780a',
          },
        }}
      >
        Make Payment
      </Button>
    </Paper>
  );
}

export default PaymentPage;
