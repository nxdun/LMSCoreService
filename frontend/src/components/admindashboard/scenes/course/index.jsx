import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, TextField, useMediaQuery, Stepper, Step, StepLabel, Typography, Card, IconButton, List, Grid, FormControlLabel, Radio, CardMedia } from "@mui/material";
import { Header } from "src/components/admindashboard/";
import { Formik } from "formik";
import * as yup from "yup";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

//defining initial values for form fields
const initialValues = {
  course_title: "",
  course_description: "",
  categories: [],
  course_picture: "",
  price: "",
  course_duration: "",
  lecturer_ID: ""
};

// Content initial values
const initialContentValues = {
  courseId: "",
  videoUrls: [],
  chapters: [],
  quizzes: [] // Add quizzes array
};

//validation schema for the form fields
const courseSchema = yup.object().shape({
  course_title: yup.string().required("Course title is required"),
  course_description: yup.string().required("Course description is required"),
  categories: yup.array().of(yup.string()).required("At least one category is required"),
  course_picture: yup.mixed()
    .test('fileRequired', 'Course picture is required', function(value) {
      return !!value;
    }),
  price: yup.number().required("Price is required"),
  course_duration: yup.string().required("Course duration is required"),
  lecturer_ID: yup.string().required("Lecturer ID is required")
});

// Quiz option type
const getEmptyQuiz = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0
});

// Reusable file upload service function
const uploadFileToServer = async (file, onProgress) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.fileUrl);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Upload failed due to network error'));
      };
    });

    xhr.open('POST', `${import.meta.env.VITE_AUTH_SERVER}/upload`, true);
    xhr.send(formData);

    return await uploadPromise;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

//form component definition
const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [contentValues, setContentValues] = useState(initialContentValues);
  const [courseFormData, setCourseFormData] = useState(null);

  const [courseImageFile, setCourseImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [uploadingCourseImage, setUploadingCourseImage] = useState(false);

  const [videoFiles, setVideoFiles] = useState({});
  const [videoPreviewUrls, setVideoPreviewUrls] = useState({});
  const [videoUploadProgress, setVideoUploadProgress] = useState({});
  const [videoUploadStatus, setVideoUploadStatus] = useState({});
  const [isUploadingVideos, setIsUploadingVideos] = useState(false);
  const [overallUploadProgress, setOverallUploadProgress] = useState(0);

  const formikRef = useRef(null);

  const steps = ['Course Information', 'Chapters & Videos', 'Quizzes', 'Review'];

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    setSuccessMessage(""); // Clear messages on step change
    setErrorMessage("");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSuccessMessage(""); // Clear messages on step change
    setErrorMessage("");
  };

  const handleStepClick = (step) => {
    if (step < activeStep && !uploadingCourseImage && !isUploadingVideos) {
      setActiveStep(step);
      setSuccessMessage(""); // Clear messages on step change
      setErrorMessage("");
    } else if (step === 0 && !uploadingCourseImage && !isUploadingVideos) {
      setActiveStep(step);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const displayStepNumber = activeStep + 1;

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleCourseImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image file size must be less than 5MB');
        return;
      }

      setCourseImageFile(file);

      if (formikRef.current) {
        formikRef.current.setFieldValue('course_picture', file);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setErrorMessage('');
    }
  };

  const uploadCourseImage = async () => {
    if (!courseImageFile) return null;

    try {
      setUploadingCourseImage(true);
      setImageUploadProgress(0);

      const imageUrl = await uploadFileToServer(courseImageFile, (progress) => {
        setImageUploadProgress(progress);
      });

      setUploadingCourseImage(false);
      return imageUrl;
    } catch (error) {
      setUploadingCourseImage(false);
      setErrorMessage("Failed to upload course image: " + error.message);
      return null;
    }
  };

  const handleVideoFileChange = (index, event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (!file.type.startsWith('video/')) {
        setErrorMessage(`Chapter ${index + 1}: Please select a valid video file`);
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setErrorMessage(`Chapter ${index + 1}: Video file size must be less than 100MB`);
        return;
      }

      setVideoFiles(prevFiles => ({
        ...prevFiles,
        [index]: file
      }));

      if (window.URL) {
        setVideoPreviewUrls(prevUrls => ({
          ...prevUrls,
          [index]: window.URL.createObjectURL(file)
        }));
      }

      setErrorMessage('');

      setVideoUploadStatus(prevStatus => ({
        ...prevStatus,
        [index]: 'pending'
      }));
    }
  };

  const uploadAllVideos = async () => {
    const videoIndexes = Object.keys(videoFiles);
    if (videoIndexes.length === 0) return true;

    setIsUploadingVideos(true);
    setOverallUploadProgress(0);

    const initialProgress = {};
    videoIndexes.forEach(index => {
      initialProgress[index] = 0;
    });
    setVideoUploadProgress(initialProgress);

    try {
      const totalVideos = videoIndexes.length;
      let uploadedCount = 0;
      const newVideoUrls = [...contentValues.videoUrls];

      for (const index of videoIndexes) {
        const file = videoFiles[index];

        setVideoUploadStatus(prev => ({
          ...prev,
          [index]: 'uploading'
        }));

        try {
          const videoUrl = await uploadFileToServer(file, (progress) => {
            setVideoUploadProgress(prev => ({
              ...prev,
              [index]: progress
            }));

            const currentProgress = { ...videoUploadProgress, [index]: progress };
            const overallProgress = Math.round(
              Object.values(currentProgress).reduce((sum, val) => sum + val, 0) / totalVideos
            );
            setOverallUploadProgress(overallProgress);
          });

          newVideoUrls[parseInt(index)] = videoUrl;

          setVideoUploadStatus(prev => ({
            ...prev,
            [index]: 'success'
          }));

          uploadedCount++;
        } catch (error) {
          console.error(`Error uploading video for chapter ${parseInt(index) + 1}:`, error);

          setVideoUploadStatus(prev => ({
            ...prev,
            [index]: 'error'
          }));

          throw new Error(`Failed to upload video for chapter ${parseInt(index) + 1}: ${error.message}`);
        }
      }

      setContentValues({
        ...contentValues,
        videoUrls: newVideoUrls
      });

      setIsUploadingVideos(false);
      return true;
    } catch (error) {
      setIsUploadingVideos(false);
      setErrorMessage(error.message);
      return false;
    }
  };

  const addChapter = () => {
    setContentValues({
      ...contentValues,
      chapters: [...contentValues.chapters, ""],
      videoUrls: [...contentValues.videoUrls, ""]
    });
  };

  const updateChapter = (index, value) => {
    const newChapters = [...contentValues.chapters];
    newChapters[index] = value;
    setContentValues({
      ...contentValues,
      chapters: newChapters
    });
  };

  const removeChapter = (index) => {
    const newChapters = contentValues.chapters.filter((_, i) => i !== index);
    const newVideoUrls = contentValues.videoUrls.filter((_, i) => i !== index);

    setContentValues({
      ...contentValues,
      chapters: newChapters,
      videoUrls: newVideoUrls
    });

    const newVideoFiles = { ...videoFiles };
    const newVideoPreviewUrls = { ...videoPreviewUrls };
    const newVideoUploadProgress = { ...videoUploadProgress };
    const newVideoUploadStatus = { ...videoUploadStatus };

    delete newVideoFiles[index];
    delete newVideoPreviewUrls[index];
    delete newVideoUploadProgress[index];
    delete newVideoUploadStatus[index];

    setVideoFiles(newVideoFiles);
    setVideoPreviewUrls(newVideoPreviewUrls);
    setVideoUploadProgress(newVideoUploadProgress);
    setVideoUploadStatus(newVideoUploadStatus);

    const reindexed = {};
    const reindexedPreviews = {};
    const reindexedProgress = {};
    const reindexedStatus = {};

    Object.keys(newVideoFiles).forEach(key => {
      const numKey = parseInt(key);
      const newKey = numKey > index ? numKey - 1 : numKey;
      reindexed[newKey] = newVideoFiles[key];
      reindexedPreviews[newKey] = newVideoPreviewUrls[key];
      reindexedProgress[newKey] = newVideoUploadProgress[key];
      reindexedStatus[newKey] = newVideoUploadStatus[key];
    });

    setVideoFiles(reindexed);
    setVideoPreviewUrls(reindexedPreviews);
    setVideoUploadProgress(reindexedProgress);
    setVideoUploadStatus(reindexedStatus);
  };

  const addQuiz = () => {
    setContentValues({
      ...contentValues,
      quizzes: [...contentValues.quizzes, getEmptyQuiz()]
    });
  };

  const removeQuiz = (quizIndex) => {
    const newQuizzes = contentValues.quizzes.filter((_, i) => i !== quizIndex);
    setContentValues({
      ...contentValues,
      quizzes: newQuizzes
    });
  };

  const updateQuiz = (quizIndex, field, value) => {
    const newQuizzes = [...contentValues.quizzes];
    newQuizzes[quizIndex] = { ...newQuizzes[quizIndex], [field]: value };
    setContentValues({
      ...contentValues,
      quizzes: newQuizzes
    });
  };

  const updateQuizOption = (quizIndex, optionIndex, value) => {
    const newQuizzes = [...contentValues.quizzes];
    const newOptions = [...newQuizzes[quizIndex].options];
    newOptions[optionIndex] = value;
    newQuizzes[quizIndex] = { ...newQuizzes[quizIndex], options: newOptions };
    setContentValues({
      ...contentValues,
      quizzes: newQuizzes
    });
  };

  const handleCourseFormSubmit = async (values, actions) => {
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage("");
    try {
      let finalValues = { ...values };
      let imageUrl = typeof values.course_picture === 'string' ? values.course_picture : null;

      if (courseImageFile && typeof values.course_picture !== 'string') {
        imageUrl = await uploadCourseImage();
        if (!imageUrl) {
          actions.setSubmitting(false);
          return;
        }
        finalValues.course_picture = imageUrl;
      } else if (!imageUrl && !courseImageFile) {
        setErrorMessage("Course picture is required.");
        actions.setSubmitting(false);
        return;
      }

      setCourseFormData(finalValues);
      actions.setSubmitting(false);
      handleNext();
    } catch (error) {
      console.error("Error in course form submission:", error);
      setErrorMessage("Error saving course information: " + (error.message || "Unknown error"));
      actions.setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      if (!courseFormData) {
        setErrorMessage("Course information is missing");
        return;
      }

      const uploadSuccess = await uploadAllVideos();
      if (!uploadSuccess) {
        return;
      }

      const courseResponse = await fetch(`${import.meta.env.VITE_AUTH_SERVER}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseFormData)
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      const courseData = await courseResponse.json();

      const contentData = {
        ...contentValues,
        courseId: courseData._id
      };

      const contentResponse = await fetch(`${import.meta.env.VITE_AUTH_SERVER}/courses/${courseData._id}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        throw new Error(errorData.message || "Failed to add course content");
      }

      setContentValues(initialContentValues);
      setCourseFormData(null);
      setActiveStep(0);
      setCourseImageFile(null);
      setImagePreview(null);
      setVideoFiles({});
      setVideoPreviewUrls({});
      setVideoUploadProgress({});
      setVideoUploadStatus({});

      if (formikRef.current) {
        formikRef.current.resetForm({ values: initialValues });
      }

      setErrorMessage("");
      setSuccessMessage("Course and content created successfully!");
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
      setSuccessMessage("");
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Formik
            onSubmit={handleCourseFormSubmit}
            initialValues={courseFormData || initialValues}
            validationSchema={courseSchema}
            innerRef={formikRef}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Course Title"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.course_title}
                    name="course_title"
                    error={!!(touched.course_title && errors.course_title)}
                    helperText={touched.course_title && errors.course_title}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Categories"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      const selectedCategories = e.target.value.split(',').map(category => category.trim());
                      handleChange({
                        target: {
                          name: 'categories',
                          value: selectedCategories,
                        },
                      });
                    }}
                    value={values.categories.join(', ')}
                    name="categories"
                    error={!!(touched.categories && errors.categories)}
                    helperText={touched.categories && errors.categories}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Course Description"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.course_description}
                    name="course_description"
                    error={!!(touched.course_description && errors.course_description)}
                    helperText={touched.course_description && errors.course_description}
                    sx={{ gridColumn: "span 4" }}
                    multiline
                    rows={4}
                  />

                  <Box sx={{ gridColumn: "span 4" }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Course Cover Image
                    </Typography>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px dashed #ccc',
                      py: 2,
                      mb: 2,
                      borderRadius: 1,
                      backgroundColor: touched.course_picture && errors.course_picture ? 'error.light' : 'background.paper'
                    }}>
                      {imagePreview ? (
                        <Box sx={{ width: '100%', maxHeight: '200px', overflow: 'hidden', mb: 2 }}>
                          <img
                            src={imagePreview}
                            alt="Course preview"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </Box>
                      ) : typeof values.course_picture === 'string' && values.course_picture ? (
                        <Box sx={{ width: '100%', maxHeight: '200px', overflow: 'hidden', mb: 2 }}>
                          <img
                            src={values.course_picture}
                            alt="Course preview"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </Box>
                      ) : (
                        <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                      )}

                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="course-image-upload"
                        type="file"
                        onChange={handleCourseImageChange}
                      />
                      <label htmlFor="course-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<ImageIcon />}
                          disabled={uploadingCourseImage}
                        >
                          {imagePreview || (typeof values.course_picture === 'string' && values.course_picture)
                            ? "Change Image"
                            : "Select Image"}
                        </Button>
                      </label>

                      {courseImageFile && (
                        <Typography variant="caption" sx={{ mt: 1 }}>
                          {courseImageFile.name} ({Math.round(courseImageFile.size / 1024)} KB)
                        </Typography>
                      )}

                      {uploadingCourseImage && (
                        <Box sx={{ width: '60%', mt: 2 }}>
                          <Box sx={{ position: 'relative', pt: 1 }}>
                            <Box sx={{
                              width: '100%',
                              bgcolor: 'grey.300',
                              height: 8,
                              borderRadius: 5
                            }} />
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: `${imageUploadProgress}%`,
                              bgcolor: 'primary.main',
                              height: 8,
                              borderRadius: 5,
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            Uploading... {imageUploadProgress}%
                          </Typography>
                        </Box>
                      )}

                      {touched.course_picture && errors.course_picture && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                          {errors.course_picture}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Price"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.price}
                    name="price"
                    error={!!(touched.price && errors.price)}
                    helperText={touched.price && errors.price}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Course Duration"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.course_duration}
                    name="course_duration"
                    error={!!(touched.course_duration && errors.course_duration)}
                    helperText={touched.course_duration && errors.course_duration}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Lecturer ID"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.lecturer_ID}
                    name="lecturer_ID"
                    error={!!(touched.lecturer_ID && errors.lecturer_ID)}
                    helperText={touched.lecturer_ID && errors.lecturer_ID}
                    sx={{ gridColumn: "span 2" }}
                  />
                </Box>

                <Box display="flex" justifyContent="flex-end" mt="20px">
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={uploadingCourseImage}
                  >
                    {uploadingCourseImage ? "Uploading Image..." : "Next"}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" mb={2}>Add Chapters with Videos</Typography>
            <List>
              {contentValues.chapters.map((chapter, index) => (
                <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Chapter {index + 1}</Typography>
                        <IconButton onClick={() => removeChapter(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Chapter Title"
                        value={chapter}
                        onChange={(e) => updateChapter(index, e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>Chapter Video</Typography>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px dashed #ccc',
                        borderRadius: 1,
                        p: 2,
                        bgcolor: videoFiles[index] ? 'background.paper' : '#f9f9f9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ mr: 2 }}>
                            <input
                              accept="video/*"
                              id={`video-upload-${index}`}
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => handleVideoFileChange(index, e)}
                            />
                            <label htmlFor={`video-upload-${index}`}>
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<VideoLibraryIcon />}
                                disabled={videoUploadStatus[index] === 'uploading'}
                              >
                                {videoFiles[index] ? "Change Video" : "Select Video"}
                              </Button>
                            </label>
                          </Box>

                          {videoFiles[index] && (
                            <Typography variant="caption" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {videoFiles[index].name} ({Math.round(videoFiles[index].size / 1024 / 1024)} MB)
                            </Typography>
                          )}
                        </Box>

                        {videoPreviewUrls[index] && (
                          <Box sx={{
                            width: '100%',
                            maxHeight: '150px',
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                            border: '1px solid #eee',
                            borderRadius: 1,
                            p: 1
                          }}>
                            <video
                              controls
                              style={{ maxHeight: '150px', maxWidth: '100%' }}
                            >
                              <source src={videoPreviewUrls[index]} type={videoFiles[index]?.type} />
                              Your browser does not support video preview.
                            </video>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </List>

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addChapter}
              sx={{ mt: 2 }}
            >
              Add Chapter
            </Button>

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                color="inherit"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                color="primary"
                variant="contained"
                disabled={contentValues.chapters.length === 0}
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" mb={2}>Add Quizzes</Typography>
            {contentValues.quizzes.map((quiz, quizIndex) => (
              <Card key={quizIndex} sx={{ mb: 3, p: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1">Quiz {quizIndex + 1}</Typography>
                  <IconButton onClick={() => removeQuiz(quizIndex)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Question"
                  value={quiz.question}
                  onChange={(e) => updateQuiz(quizIndex, 'question', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" mb={1}>Options:</Typography>
                {quiz.options.map((option, optionIndex) => (
                  <Box key={optionIndex} mb={2} display="flex" alignItems="center">
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => updateQuizOption(quizIndex, optionIndex, e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={quiz.correctAnswerIndex === optionIndex}
                          onChange={() => updateQuiz(quizIndex, 'correctAnswerIndex', optionIndex)}
                        />
                      }
                      label="Correct"
                    />
                  </Box>
                ))}
              </Card>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addQuiz}
              sx={{ mt: 2 }}
            >
              Add Quiz
            </Button>

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                color="inherit"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                color="primary"
                variant="contained"
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Review Course Content</Typography>

            {courseFormData ? (
              <Card sx={{ mb: 4, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: isNonMobile ? 'row' : 'column' }}>
                  <Box sx={{
                    width: isNonMobile ? '300px' : '100%',
                    height: isNonMobile ? 'auto' : '200px',
                    position: 'relative'
                  }}>
                    <CardMedia
                      component="img"
                      image={courseFormData.course_picture || imagePreview || '/placeholder-image.png'}
                      alt={courseFormData.course_title}
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 3, flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {courseFormData.course_title}
                    </Typography>

                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {courseFormData.categories.map((category, i) => (
                        <Box
                          key={i}
                          component="span"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.8rem'
                          }}
                        >
                          {category}
                        </Box>
                      ))}
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {courseFormData.course_description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Price:</strong> ${courseFormData.price}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {courseFormData.course_duration}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Lecturer ID:</strong> {courseFormData.lecturer_ID}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ) : (
              <Box sx={{ mb: 4, p: 3, border: '1px solid #f0f0f0', borderRadius: 2, bgcolor: '#fff9db' }}>
                <Typography color="error">
                  Course information is missing. Please go back to step 1 and complete the form.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setActiveStep(0)}
                  sx={{ mt: 1 }}
                >
                  Go to Course Information
                </Button>
              </Box>
            )}

            <Card sx={{ mb: 4, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Chapters and Videos</Typography>

              <Box sx={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #eee',
                borderRadius: 1,
                p: 1
              }}>
                {contentValues.chapters.map((chapter, index) => (
                  <Box key={index} sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                    border: videoUploadStatus[index] === 'error' ? '1px solid #f44336' : 'none'
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        <strong>Chapter {index + 1}:</strong> {chapter}
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: getVideoStatusColor(index)
                      }}>
                        <VideoLibraryIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {getVideoStatusText(index)}
                        </Typography>
                      </Box>
                    </Box>

                    {videoUploadStatus[index] === 'uploading' && (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Box sx={{ position: 'relative', pt: 1 }}>
                          <Box sx={{
                            width: '100%',
                            bgcolor: 'grey.300',
                            height: 4,
                            borderRadius: 5
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${videoUploadProgress[index] || 0}%`,
                            bgcolor: 'primary.main',
                            height: 4,
                            borderRadius: 5,
                            transition: 'width 0.3s ease'
                          }} />
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                          {videoUploadProgress[index] || 0}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Total chapters: {contentValues.chapters.length}
              </Typography>
            </Card>

            {isUploadingVideos && (
              <Card sx={{ mb: 4, p: 3, bgcolor: 'primary.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {`${Math.round(overallUploadProgress)}%`}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 40, height: 40, animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }}>
                      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid', borderColor: 'primary.main', borderTopColor: 'transparent' }} />
                    </Box>
                  </Box>
                  <Typography variant="h6">Uploading Videos: {overallUploadProgress}%</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${overallUploadProgress}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 5,
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Please wait while videos are being uploaded...</Typography>
              </Card>
            )}

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button
                color="inherit"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                color="primary"
                variant="contained"
                size="large"
                disabled={isUploadingVideos || !courseFormData}
              >
                {isUploadingVideos ? "Uploading..." : "Create Course"}
              </Button>
            </Box>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  const getVideoStatusColor = (index) => {
    if (!videoFiles[index]) return 'warning.main';

    switch (videoUploadStatus[index]) {
      case 'success': return 'success.main';
      case 'error': return 'error.main';
      case 'uploading': return 'info.main';
      default: return 'info.main';
    }
  };

  const getVideoStatusText = (index) => {
    if (!videoFiles[index]) return 'No video selected';

    switch (videoUploadStatus[index]) {
      case 'success': return 'Upload complete';
      case 'error': return 'Upload failed';
      case 'uploading': return 'Uploading...';
      default: return 'Ready to upload';
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE COURSE" subtitle="Create a New Course with Content" />

      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};

            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }

            return (
              <Step key={label} {...stepProps}>
                <StepLabel
                  {...labelProps}
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {errorMessage && (
          <Box bgcolor="error.light" p={2} mb={3} borderRadius={1}>
            <Typography color="error">{errorMessage}</Typography>
          </Box>
        )}

        {successMessage && (
          <Box bgcolor="success.light" p={2} mb={3} borderRadius={1}>
            <Typography color="success.dark">{successMessage}</Typography>
          </Box>
        )}

        {activeStep === steps.length ? (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography>Course created successfully!</Typography>
            <Box sx={{ display: 'flex', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={() => setActiveStep(0)}>Create Another Course</Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography>Step {displayStepNumber} of {steps.length}</Typography>
            </Box>
            {getStepContent(activeStep)}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Form;
