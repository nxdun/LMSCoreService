import { Formik } from "formik";
import { useState, useEffect } from "react";
import { Card, Grid, TextField, useTheme, Box, styled, Button, IconButton, Alert } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import * as Yup from "yup";
import axios from 'axios';

// STYLED COMPONENTS
const FlexBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center"
}));

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: "center"
}));

const ContentBox = styled(JustifyBox)(() => ({
  height: "100%",
  padding: "32px",
  background: "rgba(0, 0, 0, 0.01)"
}));

const JWTRegister = styled(JustifyBox)(() => ({
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": {
    maxWidth: 800,
    minHeight: 400,
    margin: "1rem",
    display: "flex",
    borderRadius: 12,
    alignItems: "center"
  }
}));

// Initial login credentials
const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  ppic: null,
  socialMedia: [""]
};

// Form field validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required!"),
  lastName: Yup.string().required("Last name is required!"),
  email: Yup.string().email("Invalid Email address").required("Email is required!"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required!"),
  ppic: Yup.mixed().required("Profile picture is required!")
    .test("fileSize", "File too large", value => value && value.size <= 2 * 1024 * 1024)
    .test("fileType", "Unsupported Format", value => value && ["image/jpeg", "image/png", "image/gif"].includes(value.type)),
  socialMedia: Yup.array().of(
    Yup.string().url("Must be a valid URL").required("Social media link cannot be empty")
  ).min(1, "At least one social media link is required")
});

export default function JwtRegister() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setUploadError(null);
    setRegistrationError(null);
    setRegistrationSuccess(false);
    let ppicUrl = null;

    if (values.ppic) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', values.ppic);

      try {
        const uploadUrl = `${import.meta.env.VITE_AUTH_SERVER}/upload`;
        console.log(`Uploading to: ${uploadUrl}`);
        const response = await axios.post(uploadUrl, uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          ppicUrl = response.data[0];
          console.log("Image Upload Success:", ppicUrl);
        } else {
          throw new Error("Invalid response format from image upload.");
        }
      } catch (error) {
        console.error("Image Upload failed:", error);
        const message = `Image upload failed: ${error.response?.data?.message || error.message}`;
        setUploadError(message);
        setRegistrationError(message);
        setLoading(false);
        return;
      }
    } else {
      console.error("Profile picture file is missing.");
      const message = "Profile picture is required.";
      setUploadError(message);
      setRegistrationError(message);
      setLoading(false);
      return;
    }

    const finalFormData = {
      role: "lecturer",
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      ppic: ppicUrl,
      socialMedia: values.socialMedia,
    };

    try {
      const registrationUrl = `${import.meta.env.VITE_AUTH_SERVER}/register`;
      console.log("Registering with:", finalFormData);
      const response = await axios.post(registrationUrl, finalFormData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Registration successful:", response.data);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      const message = `Registration failed: ${error.response?.data?.message || error.message}`;
      setRegistrationError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <JWTRegister>
      <Card className="card">
        <Grid container>
          <Grid item sm={6} xs={12}>
            <ContentBox>
              <img
                width="100%"
                alt="Register"
                src="src/assets/images/Signup.gif"
              />
            </ContentBox>
          </Grid>

          <Grid item sm={6} xs={12}>
            <Box p={4} height="100%" sx={{ overflowY: 'auto' }}>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}>
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                  <form onSubmit={handleSubmit}>

                    <TextField
                      fullWidth
                      size="small"
                      type="text"
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.firstName}
                      onChange={handleChange}
                      helperText={touched.firstName && errors.firstName}
                      error={Boolean(errors.firstName && touched.firstName)}
                      sx={{ mb: 3 }}
                      disabled={loading}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      type="text"
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.lastName}
                      onChange={handleChange}
                      helperText={touched.lastName && errors.lastName}
                      error={Boolean(errors.lastName && touched.lastName)}
                      sx={{ mb: 3 }}
                      disabled={loading}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      sx={{ mb: 3 }}
                      disabled={loading}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Password"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 3 }}
                      disabled={loading}
                    />

                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        disabled={loading}
                      >
                        Upload Profile Picture
                        <input
                          type="file"
                          hidden
                          accept="image/png, image/jpeg, image/gif"
                          name="ppic"
                          onBlur={handleBlur}
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            setFieldValue("ppic", file);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                            }
                            if (file && file.type.startsWith("image/")) {
                              setPreviewUrl(URL.createObjectURL(file));
                              setUploadError(null);
                              setRegistrationError(null);
                            } else {
                              setPreviewUrl(null);
                              if (file) {
                                setFieldValue("ppic", null);
                              }
                            }
                          }}
                        />
                      </Button>
                      {previewUrl && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <img src={previewUrl} alt="Profile Preview" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '1px', border: '2px solid grey' }} />
                        </Box>
                      )}
                      {touched.ppic && errors.ppic && !uploadError && !registrationError && (
                        <Box sx={{ color: theme.palette.error.main, fontSize: '0.75rem', mt: 1 }}>{errors.ppic}</Box>
                      )}
                      {(uploadError || registrationError) && (
                        <Box sx={{ color: theme.palette.error.main, fontSize: '0.75rem', mt: 1 }}>{uploadError || registrationError}</Box>
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Paragraph sx={{ mb: 1 }}>Social Media Links:</Paragraph>
                      {values.socialMedia.map((link, index) => (
                        <FlexBox key={index} sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            name={`socialMedia[${index}]`}
                            label={`Link ${index + 1}`}
                            value={link}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.socialMedia?.[index] && errors.socialMedia?.[index])}
                            helperText={touched.socialMedia?.[index] && errors.socialMedia?.[index]}
                            sx={{ flexGrow: 1, mr: 1 }}
                            disabled={loading}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newSocialMedia = [...values.socialMedia];
                              newSocialMedia.splice(index, 1);
                              setFieldValue('socialMedia', newSocialMedia);
                            }}
                            disabled={values.socialMedia.length <= 1 || loading}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </FlexBox>
                      ))}
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setFieldValue('socialMedia', [...values.socialMedia, ""])}
                        disabled={loading}
                      >
                        Add Link
                      </Button>
                      {touched.socialMedia && typeof errors.socialMedia === 'string' && (
                        <Box sx={{ color: theme.palette.error.main, fontSize: '0.75rem', mt: 1 }}>{errors.socialMedia}</Box>
                      )}
                    </Box>

                    {registrationSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Registration successful!
                      </Alert>
                    )}
                    {!uploadError && registrationError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {registrationError}
                      </Alert>
                    )}

                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      fullWidth
                      disabled={loading || registrationSuccess}
                      sx={{ mt: 2 }}>
                      {registrationSuccess ? "Registered" : "Register"}
                    </LoadingButton>
                  </form>
                )}
              </Formik>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </JWTRegister>
  );
}

const Paragraph = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 13,
  color: theme.palette.text.secondary,
}));
