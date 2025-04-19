import React, { useRef } from "react";
import { useSpring, animated, useTrail } from "@react-spring/web";
import {
  Card,
  styled,
  Typography,
  Button,
  Container,
  Grid,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ExploreIcon from '@mui/icons-material/Explore';
import SchoolIcon from '@mui/icons-material/School';

document.body.style.overflow = "visible"; 

// Styled components with refined design
const FullScreenContainer = styled(Container)({
  minWidth: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  minHeight: "100vh",
  padding: "20px",
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url("https://i.postimg.cc/G2Wz798T/Pngtree-abstract-fluid-gradient-background-with-1199248.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  color: "#fff",
  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  position: "relative",
  overflowX: "visible",
  "@media (max-width: 768px)": {
    padding: "20px",
  },
});

const InstructorButton = styled(animated(Button))({
  backgroundColor: "rgba(106, 27, 154, 0.5)", // Reduced opacity for transparency
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(106, 27, 154, 0.25)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "30px",
  padding: "12px 28px",
  transition: "all 0.3s ease",
  fontWeight: 600,
  letterSpacing: "0.5px",
  marginRight: "12px",
  "&:hover": {
    backgroundColor: "rgba(106, 27, 154, 0.7)", // Slightly darker on hover
    transform: "translateY(-3px)",
    boxShadow: "0 12px 20px rgba(106, 27, 154, 0.4)",
  },
});

const SignupButton = styled(animated(Button))({
  backgroundColor: "rgba(255, 109, 0, 0.5)", // Reduced opacity for transparency
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(255, 109, 0, 0.25)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "30px",
  padding: "12px 28px",
  transition: "all 0.3s ease",
  fontWeight: 600,
  letterSpacing: "0.5px",
  "&:hover": {
    backgroundColor: "rgba(255, 109, 0, 0.7)", // Slightly darker on hover
    transform: "translateY(-3px)",
    boxShadow: "0 12px 20px rgba(255, 109, 0, 0.4)",
  },
});

const CourseOverviewSection = styled(animated.section)({
  padding: "80px 20px",
  background: `url('src/assets/commonbg.jpg')`,
  backgroundColor: "transparent",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  textAlign: "center",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  }
});

const SectionTitle = styled(Typography)({
  position: "relative",
  display: "inline-block",
  marginBottom: "50px",
  fontWeight: "700",
  zIndex: 1,
  "&:after": {
    content: '""',
    position: "absolute",
    width: "60px",
    height: "4px",
    background: "#6a1b9a",
    bottom: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: "2px",
  }
});

// Enhanced card styling with glassmorphism effect
const EnhancedCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "24px",
  overflow: "hidden",
  transition: "transform 0.4s ease, box-shadow 0.4s ease",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  position: "relative",
  zIndex: 1,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 1)",
    transition: "background 0.2s ease-in, box-shadow 0.4s ease",
    background: "rgba(255, 255, 255, 0.8)",

  }
}));

const CardImageContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
  height: "400px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 1)",
  backdropFilter: "blur(5px)",
});

const BlurBox = styled(animated.div)({
  position: "relative",
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(10px)",
  borderRadius: "24px",
  padding: "40px",
  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
  zIndex: 1,
  width: "100%",
  maxWidth: "800px",
  margin: "auto",
});

// Improved 3D character image effect
const CharacterImage3D = styled(Box)({
  position: "relative",
  width: "100%",
  maxWidth: "400px",
  margin: "20px auto 40px",
  zIndex: 1, // Lowered z-index to ensure it doesn't overlap text
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-20px",
    left: "5%",
    right: "5%",
    height: "40px",
    background: "rgba(255, 255, 255, 0.2)",
    filter: "blur(15px)",
    borderRadius: "50%",
    zIndex: -1, // Ensure the glow stays behind the image
  }
});

const CharacterImageContainer = styled(Box)({
  position: "relative",
  borderRadius: "24px",
  overflow: "visible",
  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
  border: "3px solid rgba(255, 255, 255, 0.2)",
  zIndex: 1, // Ensure it doesn't overlap text
});

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const courseOverviewRef = useRef(null);

  // Enhanced animations
  const heroSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { tension: 280, friction: 20 },
  });

  const buttonSpring = useSpring({
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 400,
    config: { tension: 280, friction: 20 },
  });

  const blurBoxSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
    delay: 300,
    config: { tension: 280, friction: 25 },
  });
  
  // Trail animation for cards
  const trail = useTrail(6, {
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { mass: 1, tension: 270, friction: 25 },
  });

  // Data for cards with consistent color theme
  const cardData = [
    {
      image: "src/assets/learn2.gif",
      title: "Diverse Course Catalog",
      description: "Explore an extensive and diverse catalog of courses covering a wide array of subjects and disciplines to cater to various interests and skill levels.",
      icon: <ExploreIcon fontSize="large" />,
      color: "#6a1b9a"
    },
    {
      image: "src/assets/learn3.gif",
      title: "Empower Educators",
      description: "Educators have the incredible opportunity to create, curate, and customize courses according to their unique teaching styles, pedagogical approaches, and curriculum requirements.",
      icon: <SchoolIcon fontSize="large" />,
      color: "#6a1b9a"
    },
    {
      image: "src/assets/learn4.gif",
      title: "Seamless Responsive Design",
      description: "Experience seamless navigation and engagement across all devices, including desktops, laptops, tablets, and smartphones, ensuring a consistent and optimized learning experience anytime, anywhere.",
      icon: <ExploreIcon fontSize="large" />,
      color: "#6a1b9a"
    },
    {
      image: "src/assets/learn1.gif",
      title: "Intuitive Interface",
      description: "Navigate through courses effortlessly with our intuitive and user-friendly interface designed to provide a streamlined learning experience, enabling learners to focus on acquiring new knowledge and skills.",
      icon: <SchoolIcon fontSize="large" />,
      color: "#6a1b9a"
    },
    {
      image: "src/assets/learn5.gif",
      title: "Personalized Learning Paths",
      description: "Receive personalized recommendations and tailored learning paths based on your individual learning preferences, goals, and prior knowledge, empowering you to achieve your learning objectives more effectively.",
      icon: <ExploreIcon fontSize="large" />,
      color: "#6a1b9a"
    },
    {
      image: "src/assets/learn6.gif",
      title: "Secure Payment Process",
      description: "Rest assured with our robust and secure payment gateway, ensuring the confidentiality, integrity, and safety of your financial transactions, providing you with peace of mind throughout the payment process.",
      icon: <SchoolIcon fontSize="large" />,
      color: "#6a1b9a"
    }
  ];

  return (
    <>
      <FullScreenContainer maxWidth={false} disableGutters>
        <animated.div style={blurBoxSpring}>
          <BlurBox>
            <animated.div style={heroSpring}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h1"
                gutterBottom
                sx={{ 
                  color: "#f9a826", 
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  zIndex: 2, // Ensure text stays above the 3D character
                  position: "relative",
                }}
              >
                Welcome to StudyForge
              </Typography>
              
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  color: "white",
                  fontWeight: 300,
                  maxWidth: "700px",
                  margin: "0 auto 75px",
                  lineHeight: 1.6,
                  position: "relative",
                }}
              >
                Unlock your potential with expert-led courses designed to elevate your skills and transform your career path.
              </Typography>
              
              <CharacterImage3D>
                <CharacterImageContainer>
                  <img
                    src="src/assets/images/landingpage-learn.png"
                    alt="StudyForge learning illustration"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      transform: "scale(1.05) translateY(-10%)", // Increased scale and translate values
                      marginTop: "-8%", // Increased top offset
                      position: "relative",
                      zIndex: 1, // Ensure it doesn't overlap text
                    }}
                  />
                </CharacterImageContainer>
              </CharacterImage3D>
            </animated.div>

            <animated.div style={buttonSpring}>
              <Box 
                sx={{ 
                  display: "flex", 
                  flexDirection: isMobile ? "column" : "row", 
                  gap: isMobile ? 2 : 3,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "650px",
                  margin: "10px auto 5px",
                  padding: "0 15px",
                }}
              >
                <InstructorButton
                  onClick={() => {
                    courseOverviewRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="large"
                  variant="contained"
                  startIcon={<KeyboardDoubleArrowDownIcon sx={{ fontSize: 22 }} />}
                  endIcon={<KeyboardDoubleArrowDownIcon sx={{ fontSize: 22 }} />}
                  fullWidth={isMobile}
                  sx={{ 
                    py: 1.8,
                    px: isMobile ? 4 : 5,
                    fontSize: "1rem",
                    flexGrow: 1.5,
                    maxWidth: isMobile ? "100%" : "55%",
                    textTransform: "none",
                  }}
                >
                  Discover Our Features
                </InstructorButton>
                
                <SignupButton
                  size="large"
                  variant="contained"
                  onClick={() => (window.location.href = "/login")}
                  fullWidth={isMobile}
                  sx={{ 
                    py: 1.8,
                    px: isMobile ? 4 : 5,
                    fontSize: "1rem",
                    flexGrow: 1,
                    maxWidth: isMobile ? "100%" : "35%",
                    textTransform: "none", 
                  }}
                >
                  Get Started
                </SignupButton>
              </Box>
            </animated.div>
          </BlurBox>
        </animated.div>
      </FullScreenContainer>

      <CourseOverviewSection ref={courseOverviewRef}>
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, color: "#fff" }}>
          <SectionTitle variant="h3" component="h2" >
            What StudyForge Offers
          </SectionTitle>
          
          <Grid container spacing={3} sx={{ px: { xs: 0, md: 4 } }}>
            {trail.map((springProps, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <animated.div style={springProps}>
                  <EnhancedCard>
                    <CardImageContainer>
                      <CardMedia
                        component="img"
                        alt={cardData[index].title}
                        image={cardData[index].image}
                        sx={{ 
                          height: "100%",
                          objectFit: "contain",
                          padding: "16px",
                          transition: "transform 0.4s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          }
                        }}
                      />
                    </CardImageContainer>
                    
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      padding: 3,
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(7px)"
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: "center" }}>
                        <Box sx={{ color: cardData[index].color, fontSize: "2rem", display: "flex" }}>
                          {cardData[index].icon}
                        </Box>
                        <Typography 
                          gutterBottom 
                          variant="h5" 
                          component="h3" 
                          sx={{ 
                            ml: 1,
                            fontWeight: 600,
                            color: cardData[index].color,
                          }}
                        >
                          {cardData[index].title}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2, width: '40%', mx: 'auto', borderColor: 'rgba(106, 27, 154, 0.3)' }} />
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: "#333",
                          lineHeight: 1.7,
                          fontSize: "0.95rem",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        {cardData[index].description}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ 
                      padding: "16px",
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(5px)"
                    }}>
                      <Button 
                        fullWidth 
                        size="large" 
                        variant="contained"
                        sx={{ 
                          borderRadius: "30px",
                          backgroundColor: "rgba(106, 27, 154, 0.85)",
                          backdropFilter: "blur(5px)",
                          color: "white",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "rgba(74, 20, 140, 0.9)",
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </CardActions>
                  </EnhancedCard>
                </animated.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </CourseOverviewSection>
    </>
  );
};

export default LandingPage;
