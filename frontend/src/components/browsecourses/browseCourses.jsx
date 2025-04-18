import { Grid, Card, CardContent, Typography, Avatar, Button, CardMedia, Box } from "@mui/material";
import PropTypes from "prop-types";

// Component to display a list of courses
const BrowseCourses = ({ sampleCourseData }) => {
    // Log the sample course data for debugging
    console.log(sampleCourseData);

    // Function to handle the enroll action
    const EnrollAction = (courseId) => {
        if (!courseId) return;
        window.location.href = `/browse/view/${courseId}`;
    };

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
        <div>
            <Grid container spacing={3} sx={{ paddingTop: "10vh" }}>
                {sampleCourseData.map((course) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                        <Card
                            style={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "10px",
                            }}
                        >
                            {/* Course image */}
                            <CardMedia
                                component="img"
                                height="140"
                                image={course.course_picture}
                                alt={course.course_title}
                                style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
                            />
                            <CardContent style={{ flexGrow: 1 }}>
                                {/* Course title */}
                                <Typography variant="h6" gutterBottom>
                                    {course.course_title}
                                </Typography>
                                {/* Course description */}
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {course.course_description}
                                </Typography>
                                {/* Course categories */}
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Categories: {course.categories.join(", ")}
                                </Typography>
                                {/* Course price and duration */}
                                <Typography variant="body2" color="textSecondary">
                                    Price: ${course.price} | Duration: {course.course_duration}
                                </Typography>
                                {/* Lecturer details */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginTop: "10px",
                                    }}
                                >
                                    <Avatar
                                        src={course.lecturer?.ppic || ""}
                                        alt={course.lecturer?.name || "Lecturer"}
                                    />
                                    <Typography
                                        variant="body2"
                                        style={{ marginLeft: "10px" }}
                                    >
                                        {course.lecturer?.name || "Unknown Lecturer"}
                                    </Typography>
                                </div>
                            </CardContent>
                            {/* Enroll button */}
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ marginTop: "auto" }}
                                fullWidth
                                onClick={() => EnrollAction(course._id)}
                            >
                                Enroll
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

// PropTypes for type checking
BrowseCourses.propTypes = {
    sampleCourseData: PropTypes.array,
};

export default BrowseCourses;
