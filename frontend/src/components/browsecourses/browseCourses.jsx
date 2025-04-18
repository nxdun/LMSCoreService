import { Grid, Card, CardContent, Typography, Avatar, Button, CardMedia, Box } from "@mui/material"; // Removed Chip import
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PropTypes from "prop-types";
import { useState } from "react";

// note: Component to display a single course card with fallback image logic
const CourseCard = ({ course }) => {
    
    const fallbackImage = "src/assets/pnf.svg"; // Path to your fallback image
    // !: Initialize imgSrc with course_picture OR fallbackImage if course_picture is falsy (null, undefined, empty string)
    const [imgSrc, setImgSrc] = useState(course.course_picture || fallbackImage);

    const handleImageError = () => {
        // !: This function sets the fallback image source if the original image fails to load.
        // Check if the current source is already the fallback to prevent potential loops.
        if (imgSrc !== fallbackImage) {
            setImgSrc(fallbackImage);
        }
    };

    // Function to handle the enroll action
    const EnrollAction = (courseId) => {
        if (!courseId) return;
        window.location.href = `/browse/view/${courseId}`;
    };

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "15px",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                color: '#fff',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 35px 0 rgba(31, 38, 135, 0.40)',
                },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Container for Image and Lecturer Overlay */}
            <Box sx={{ position: 'relative', height: '180px' }}>
                {/* Course image with fallback */}
                <CardMedia
                    component="img"
                    height="180"
                    image={imgSrc} // Use state variable for image source
                    alt={course.course_title}
                    onError={handleImageError} // Handle image load error
                    sx={{
                        borderTopLeftRadius: "15px",
                        borderTopRightRadius: "15px",
                        objectFit: 'cover',
                        opacity: 0.85,
                        width: '100%',
                        height: '100%',
                    }}
                />
                {/* Lecturer details - Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Avatar
                        src={course.lecturer?.ppic || ""}
                        alt={course.lecturer?.name || "Lecturer"}
                        sx={{ width: 28, height: 28, border: '1px solid rgba(255, 255, 255, 0.5)' }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ marginLeft: "8px", color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}
                    >
                        {course.lecturer?.name || "Unknown Lecturer"}
                    </Typography>
                </Box>
            </Box>

            {/* Adjusted CardContent padding */}
            <CardContent sx={{ flexGrow: 1, padding: '16px 20px 10px 20px' }}>
                {/* Course title - Enhanced Typography */}
                <Typography variant="h6" gutterBottom sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    mb: 1,
                    lineHeight: 1.3,
                    letterSpacing: '0.2px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
                }}>
                    {course.course_title}
                </Typography>

                {/* Course description - Enhanced Typography */}
                <Typography variant="body2" gutterBottom sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.45,
                    mb: 1.5,
                    height: '4.35em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {course.course_description}
                </Typography>

                {/* Course categories - Moved after description, left-aligned, comma-separated text */}
                <Typography variant="caption" sx={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    display: 'block',
                    mb: 1.5,
                    fontStyle: 'italic',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                }}>
                    Tags: {course.categories.join(", ")}
                </Typography>

                {/* Course price and duration - Enhanced Layout */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: '#ffeb3b',
                        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)'
                    }}>
                        ${course.price}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, display: 'inline-block' }}>
                            {course.course_duration}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
            {/* Enroll button */}
            <Box sx={{ p: '10px 20px 20px 20px', marginTop: 'auto' }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => EnrollAction(course._id)}
                    sx={{
                        background: 'rgba(128, 0, 128, 0.3)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.85em',
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            background: 'rgba(148, 0, 148, 0.4)',
                            transform: 'scale(1.03)',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                        },
                        '&:active': {
                            transform: 'scale(0.98)',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                            background: 'rgba(108, 0, 108, 0.4)',
                        }
                    }}
                >
                    Enroll Now
                </Button>
            </Box>
        </Card>
    );
};

// note: Main component to browse courses
const BrowseCourses = ({ sampleCourseData }) => {
    // Log the sample course data for debugging
    console.log(sampleCourseData);

    // Render a message if no courses are available
    if (!sampleCourseData || sampleCourseData.length === 0) {
        return (
            <Box sx={{ textAlign: "center", marginTop: "20vh" }}>
                <Typography variant="h4" color="textSecondary">
                    No courses available at the moment.
                </Typography>
            </Box>
        );
    }

    // Render the course cards
    return (
        <Box sx={{
            padding: { xs: 2, sm: 4, md: 6 },
            minHeight: "100vh",
            // tip: Consider adding a background image/gradient to the parent element or body for the glassmorphism to be most effective.
        }}>
            <Grid container spacing={4} sx={{ paddingTop: "5vh" }}>
                {sampleCourseData.map((course) => (
                    // Use the CourseCard component for each course
                    <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                       <CourseCard course={course} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// PropTypes for type checking
CourseCard.propTypes = {
    course: PropTypes.object.isRequired,
};

BrowseCourses.propTypes = {
    sampleCourseData: PropTypes.array,
};

export default BrowseCourses;
