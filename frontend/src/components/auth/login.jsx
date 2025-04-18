import { useState } from "react";
import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Typography,
  Link,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import DynamicBackdrop from "src/components/common/backdrop";
import { Logsin } from "src/services/authService";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

// Disable scrollbar for the entire UI
document.body.style.overflow = "hidden";

//functional component for the login page
const Login = () => {
  //state variables for username, password, and loading state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");

  //styling for paper, avatar, and buttons
  const paperStyle = {
    padding: "50px 40px",
    height: "80vh",
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

  //function to handle form submission and login process
  const onSignUp = async () => {
    setLoading(false);
    //validate password have at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    //valdate username at least 5 characters
    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
      );
      setLoading(false);
      return;
    }

    //validate username length
    if (username.length < 5) {
      alert("email must contain at least 5 characters");
      setLoading(false);
      return;
    }


    // Attempt login with provided credentials
    const success = await Logsin(username, password);

    // Display success message and redirect on successful login
    if (success) {

      //success alert
      let timerInterval;
      Swal.fire({
        title: "Login successful!",
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
          window.location.href = "/browse";
        }
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const onCaptchaCheck = (e) => {
    e.preventDefault();

    if (!captcha) {
      Swal.fire({
        title: "Oops!",
        text: "Please complete the captcha",
        icon: "warning",
        confirmButtonText: "Okay",
      });
      return;
    } else {
      setLoading(true);
      axios.post(
        `${import.meta.env.VITE_AUTH_SERVER}/cap`,
        {
          captcha: captcha,
        }
      )
        .then((response) => {
          console.log("succesfull captcha response  ", response.data);
          setCaptcha("");
          //now handles login
          onSignUp();
        })
        .catch((error) => {
          console.log("error in captcha response ", error);
          Swal.fire({
            title: "Oops!",
            text: "Captcha verification failed",
            icon: "error",
            confirmButtonText: "Okay",
          });
          setLoading(false);
        });
    }
  };
  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <LocalLibraryIcon style={{ fontSize: "35px" }} />
          </Avatar>
          <h2 style={{ fontFamily: "'Roboto', sans-serif", color: "#fff" }}>
            Welcome Back!
          </h2>
        </Grid>
        <form onSubmit={(e) => onCaptchaCheck(e)}>
          <TextField
            label="Email"
            placeholder="Enter your email"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={textFieldStyle}
            InputLabelProps={{ style: { color: "#ccc" } }}
            inputProps={{ style: { color: "#fff" } }}
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
          />
          <FormControlLabel
            control={<Checkbox name="remember" color="primary" />}
            label="Remember me"
            style={{ color: "#ccc" }}
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
            Sign In
          </Button>
        </form>
        <Typography style={{ ...typographyStyle, marginTop: "15px" }}>
          <Link href="#" style={linkStyle}>
            Forgot your password?
          </Link>
        </Typography>
        <Typography style={{ ...typographyStyle, marginTop: "15px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={linkStyle}>
            Sign Up
          </Link>
        </Typography>
      </Paper>
      <DynamicBackdrop open={loading} />
    </Grid>
  );
};

export default Login;
