import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Button,
  Skeleton,
  Divider,
  Box,
  IconButton
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Backdrop from "src/components/common/backdrop.jsx";
import axios from "axios";

const getCategoryColor = (index) => {
    const colors = [
        'rgba(255, 179, 186, 0.75)',
        'rgba(186, 255, 201, 0.75)',
        'rgba(186, 225, 255, 0.75)',
        'rgba(255, 223, 186, 0.75)',
        'rgba(229, 186, 255, 0.75)',
        'rgba(255, 255, 186, 0.75)',
        'rgba(186, 255, 255, 0.75)',
    ];
    return colors[index % colors.length];
};

const getCategoryTextColor = (index) => {
    const colors = [
        '#a8323e',
        '#32a852',
        '#3277a8',
        '#a87b32',
        '#7b32a8',
        '#a8a832',
        '#32a8a8',
    ];
    return colors[index % colors.length];
}

const glassCardSx = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  color: '#e0e0e0',
  borderRadius: "15px",
  mb: 3,
  overflow: 'hidden',
  '& h4, & h5, & h6': {
      color: '#ffffff',
  },
  '& .MuiDivider-root': {
      borderColor: 'rgba(255, 255, 255, 0.15)',
  }
};

const CourseSPA = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const fallbackImage = "/assets/pnf.svg";

  console.log(courseData);

  useEffect(() => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid course ID");
      setLoading(false);
      return;
    }
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const courseResponse = await axios.get(
          `${import.meta.env.VITE_AUTH_SERVER}/browse/${id}`
        );
        const course = courseResponse.data;

        setImgSrc(course.course_picture || fallbackImage);

        const lecturerResponse = await axios.get(
          `${import.meta.env.VITE_AUTH_SERVER}/lecget/${course.lecturer_ID}`
        );
        const lecturer = lecturerResponse.data;

        setCourseData({ ...course, lecturer });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setImgSrc(fallbackImage);
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const navigate = useNavigate();

  const handleImageError = () => {
    if (imgSrc !== fallbackImage) {
      setImgSrc(fallbackImage);
    }
  };

  const handleEnrollNow = () => {
    navigate('/payment', { state: { courseData } });
  };

  const handleGoBack = () => {
    navigate('/browse');
  };

  if (loading) {
    return (
      <>
        <Backdrop open={loading} />
        <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, minHeight: '100vh' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2, bgcolor: 'grey.500' }} />
            <Skeleton variant="rectangular" animation="wave" width="100%" height="220px" sx={{ borderRadius: '15px', mb: 3, bgcolor: 'grey.500' }} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="rectangular" animation="wave" width="100%" height="150px" sx={{ borderRadius: '15px', mb: 3, bgcolor: 'grey.500' }} />
                    <Skeleton variant="rectangular" animation="wave" width="100%" height="100px" sx={{ borderRadius: '15px', mb: 3, bgcolor: 'grey.500' }} />
                    <Skeleton variant="rectangular" animation="wave" width="100%" height="180px" sx={{ borderRadius: '15px', mb: 3, bgcolor: 'grey.500' }} />
                </Grid>
                 <Grid item xs={12} md={4}>
                     <Skeleton variant="rectangular" animation="wave" width="100%" height="120px" sx={{ borderRadius: '15px', bgcolor: 'grey.500' }} />
                 </Grid>
            </Grid>
        </Box>
      </>
    );
  }

  if (!courseData) {
    return (
        <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <IconButton onClick={handleGoBack} sx={{ background: 'rgba(0,0,0,0.1)', '&:hover': { background: 'rgba(0,0,0,0.2)' } }} aria-label="go back">
                    <ArrowBackIcon />
                </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" color="text.secondary">Course not found or invalid ID.</Typography>
            </Box>
        </Box>
    );
  }

  return (
    <Box sx={{
        padding: { xs: 2, sm: 4, md: 6 },
        minHeight: "100vh",
    }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
                onClick={handleGoBack}
                sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                    }
                }}
                aria-label="go back"
            >
                <ArrowBackIcon />
            </IconButton>
        </Box>

      <Grid container spacing={4}>

        <Grid item xs={12} md={8}>
            <Card sx={{ ...glassCardSx, mb: 3 }}>
                 <CardMedia
                    component="img"
                    height="220"
                    image={imgSrc}
                    alt={courseData.course_title}
                    onError={handleImageError}
                    sx={{ objectFit: 'cover', opacity: 0.9, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                 />
                 <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' }}>
                        {courseData.course_title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                            {courseData.course_duration} to complete
                        </Typography>
                    </Box>
                 </CardContent>
            </Card>

            <Card sx={{ ...glassCardSx, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Course Description
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>
                  {courseData.course_description}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ ...glassCardSx, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Categories
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {courseData.categories && courseData.categories.length > 0 ? (
                    courseData.categories.map((category, index) => (
                      <Chip
                        key={index}
                        label={category}
                        size="medium"
                        sx={{
                            backgroundColor: getCategoryColor(index),
                            color: getCategoryTextColor(index),
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            height: '28px',
                            borderRadius: '10px',
                            '& .MuiChip-label': { paddingX: '10px' },
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>No categories listed.</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
        </Grid>

        <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: '80px' } }}>
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ ...glassCardSx, height: '100%' }}>
                      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                          About the Instructor
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              src={courseData.lecturer.ppic}
                              alt={courseData.lecturer.name}
                              sx={{ width: 56, height: 56, border: '2px solid rgba(255, 255, 255, 0.4)' }}
                            />
                            <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                              {courseData.lecturer.name}
                            </Typography>
                        </Box>
                        <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5, mb: 2, flexGrow: 1, overflowY: 'auto' }}>
                          {courseData.lecturer.bio || "No bio available."}
                        </Typography>
                        <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, mt: 'auto' }}>
                          Social Media:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {courseData.lecturer.socialMedia && courseData.lecturer.socialMedia.length > 0 ? (
                            courseData.lecturer.socialMedia.map((social, index) => (
                              <Chip
                                key={index}
                                label={social}
                                size="small"
                                clickable
                                component="a"
                                href={social.startsWith('http') ? social : `//${social}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    color: '#e0e0e0',
                                    '&:hover': { background: 'rgba(255, 255, 255, 0.25)'}
                                }}
                              />
                            ))
                          ) : (
                             <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Not available.</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card sx={glassCardSx}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                         <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffeb3b', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', mb: 2 }}>
                            {Number(courseData.price)} LKR
                         </Typography>
                         <Divider sx={{ mb: 2 }} />
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={courseData.enrollState}
                          onClick={handleEnrollNow}
                          sx={{
                              background: 'rgba(128, 0, 128, 0.4)',
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#fff',
                              borderRadius: '20px',
                              padding: '12px 20px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              fontSize: '0.9em',
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                              transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
                              '&:hover': {
                                  background: 'rgba(148, 0, 148, 0.5)',
                                  transform: 'scale(1.03)',
                                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&:active': {
                                  transform: 'scale(0.98)',
                                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                                  background: 'rgba(108, 0, 108, 0.5)',
                              },
                              '&.Mui-disabled': {
                                background: 'rgba(128, 128, 128, 0.15)',
                                color: 'rgba(255, 255, 255, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'not-allowed',
                                pointerEvents: 'auto'
                              }
                          }}
                        >
                          {courseData.enrollState ? "Already Enrolled" : `Enroll Now`}
                        </Button>
                      </CardContent>
                    </Card>
                </Box>
            </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseSPA;
