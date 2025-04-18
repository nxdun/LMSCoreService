import { useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests
import * as yup from "yup"; // Import yup for validation

//import MUI components for building the registration form
import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Typography,
  Link,
} from "@mui/material";
import Swal from "sweetalert2"; 

import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import DynamicBackdrop from 'src/components/common/backdrop'; // Import the backdrop component
import ReCAPTCHA from "react-google-recaptcha";
// Define Yup schema for validation
const userSchema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// Disable scrollbar for the entire UI
document.body.style.overflow = "hidden";

//functional component for the registration page
const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // State to store validation errors
  const [captcha, setCaptcha] = useState("");

  //styling for paper, avatar, and buttons
  const paperStyle = {
    padding: "50px 40px",
    height: "85vh",
    width: 500,
    margin: "10vh auto",
    background: "rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const avatarStyle = {
    backgroundColor: "#4caf50",
    width: "70px",
    height: "70px",
  };

  const btnstyle = {
    margin: "25px 0",
    backgroundColor: "#4caf50",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "18px",
    padding: "12px 0",
  };

  const textFieldStyle = {
    margin: "15px 0",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#fff",
  };

  const typographyStyle = {
    color: "#ddd",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "14px",
  };

  const linkStyle = {
    color: "#4caf50",
    textDecoration: "none",
    fontWeight: "bold",
  };

  //function to handle registration
  const handleRegister = async () => {
    try {
      
      setLoading(true);
      // Validate input using Yup schema
      await userSchema.validate({ firstName, lastName, email, password }, { abortEarly: false });
      
      // Make a POST request to your backend API endpoint for user registration
      await axios.post(`${import.meta.env.VITE_AUTH_SERVER}/register`, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
      });
      // Registration successful, you may redirect the user to login or show a success message
      let timerInterval;
      Swal.fire({
        title: "Registration successful!",
        text: `Redirecting to user space`,
        icon: "success",
        showCancelButton: false,
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: "#FF2E63",
        cancelButtonColor: "#08D9D6",
        didOpen: () => {
          Swal.showLoading();
          // Access the timer element within the Swal popup
          const timerElement = document.querySelector(
            ".Swal2-timer-progress-bar"
          );
          timerInterval = setInterval(() => {
            if (timerElement) {
              timerElement.style.width = `${Swal.getTimerLeft()}%`;
            }
          }, 400);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          window.location.href = "/login/learner";
        }
      });
    } catch (error) {
      // Handle validation errors
      if (error.name === "ValidationError") {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please check the form for errors",
        });

        setValidationErrors(error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {}));
      } else {  
        Swal.fire({
          icon: "error",
          title: "Registration Error",
          text: "A Network error occurred while registering the user",
        });
        console.error("Error registering user:", error);
      }
      setLoading(false);
    }
  };

  //function to handle form submission and registration
  const onSignUp = (e) => {
    e.preventDefault();
    
    handleRegister();
  };

  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <HowToRegOutlinedIcon style={{ fontSize: "35px" }} />
          </Avatar>
          <h2 style={{ fontFamily: "'Roboto', sans-serif", color: "#fff" }}>
            Create Your Account
          </h2>
        </Grid>
        <form onSubmit={onSignUp}>
          <TextField
            label="First Name"
            placeholder="Enter your first name"
            fullWidth
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={textFieldStyle}
            InputLabelProps={{ style: { color: "#ccc" } }}
            inputProps={{ style: { color: "#fff" } }}
            error={!!validationErrors.firstName}
            helperText={validationErrors.firstName}
          />
          <TextField
            label="Last Name"
            placeholder="Enter your last name"
            fullWidth
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={textFieldStyle}
            InputLabelProps={{ style: { color: "#ccc" } }}
            inputProps={{ style: { color: "#fff" } }}
            error={!!validationErrors.lastName}
            helperText={validationErrors.lastName}
          />
          <TextField
            label="Email"
            placeholder="Enter your email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={textFieldStyle}
            InputLabelProps={{ style: { color: "#ccc" } }}
            inputProps={{ style: { color: "#fff" } }}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            label="Password"
            placeholder="Enter your password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={textFieldStyle}
            InputLabelProps={{ style: { color: "#ccc" } }}
            inputProps={{ style: { color: "#fff" } }}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
          />
          <ReCAPTCHA
            sitekey="6Leg6dgpAAAAAOHOV9pQsn14p_G09lqGUsuEKPW6"
            onChange={(token) => setCaptcha(token)}
            onExpired={() => setCaptcha("")}
            data-testid="recaptcha"
            style={{ margin: "15px 0" }}
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
          >
            Register
          </Button>
        </form>
        <Typography style={{ ...typographyStyle, marginTop: "15px" }}>
          Already have an account?{" "}
          <Link href="/login" style={linkStyle}>
            Login
          </Link>
        </Typography>
      </Paper>
      <DynamicBackdrop open={loading} />
    </Grid>
  );
};

export default Register;
