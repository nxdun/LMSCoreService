const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcryptjs"); //for password hashing
const axios = require("axios");
const { logger } = require("./logger");
const apiEndpointAddress = process.env.API_GATEWAY_ADDRESS || "BAD_IMPORT"; // Default to localhost if not set
const mongoose = require("mongoose"); //for mongo object id validation

//route handler for user creation
//send post request to '/' endpoint //change endpoint later!

router.get("/", async (req, res) => {
  try {
    //get all users
    const users = await User.find();
    logger.info("All users fetched successfully:", users);
    res.status(200).send(users);
  } catch (error) {
    //error handling
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

//get courses for user id
router.get("/courses/:id", async (req, res) => {
  try {
    //validate id param as mongo id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.info("Invalid user id:", req.params.id);
      return res.status(400).send({ message: "Invalid user id!" });
    }
    //find user with given email
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logger.info("User not found:", req.body.email);
      return res.status(404).send({ message: "User not found!" });
    }

    let courses = [];
    //! fix here
    // for(let i = 0; i < user.enrolledCourses.length; i++){
    //     console.log(`http://coursemanagement-service:3002/api/v1/courses/${user.enrolledCourses[i].toString()}`);
    //     const course = await axios.get(`http://coursemanagement-service:3002/api/v1/courses/${user.enrolledCourses[i].toString()}`);

    //     courses.push(course.data);
    // }
    // console.log(courses);
    res.status(200).send(courses);
  } catch (error) {
    //error handling
    res.status(500).send({ message: "Internal Server Error!", error: error });
  }
});

router.post("/", async (req, res) => {
  try {
    // Validate user input
    const { error } = validate(req.body);
    if (error) {
      logger.error("Validation error:", error);
      return res.status(400).send({ message: error.details[0].message });
    }

    // Check if user with entered email already exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      logger.info("User with given email already exists:", req.body.email);
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    if (req.body.role === "lecturer") {
      //generate common mongo id
      const commonId = new mongoose.Types.ObjectId();
      // Special handling for lecturers
      const endpoint = `${apiEndpointAddress}/transferlecturer`;

      // to the lecturer service
      const axiosPost = axios.post(endpoint, {
        _id: commonId,
        name: req.body.firstName,
        email: req.body.email,
        ppic: req.body.ppic,
        courses: [],
        socialMedia: req.body.socialMedia || [],
      });

      //adding authentication entry
      const createUser = new User({
        _id: commonId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: "lecturer",
        password: hashedPassword,
        createdCourses: [], 
      }).save();

      try {
        // Wait for both to succeed
        await Promise.all([axiosPost, createUser]);
        logger.info("Lecturer created successfully:", req.body.email);
      } catch (error) {
        // Handle failure if either fails
        logger.error("Failed to create", error);
        return res
          .status(500)
          .send({ message: "Failed to create lecturer!", error });
      }
    } else {
      // Default handling for other roles
      await new User({
        ...req.body,
        password: hashedPassword,
      }).save();
      logger.info("User created successfully:", req.body.email);
    }

    // Get new user id
    const u = await User.findOne({ email: req.body.email });

    // Note: send notification to user from here
    // axios.post('http://notification-service:1114/notifications', {
    //     userId: u._id,
    //     message: `⭐ Welcome ${u.firstName} ${u.lastName} to the LMS!`
    // });

    // Send success message
    res.status(201).send({ message: "User created successfully!" });
  } catch (error) {
    // Error handling
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

router.post("/enroll/:id", async (req, res) => {
  try {
    // Validate id param as mongo id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.info("Invalid user id:", req.params.id);
      return res.status(400).send({ message: "Invalid user id!" });
    }

    // Find user with given id
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logger.info("User not found:", req.params.id);
      return res.status(404).send({ message: "User not found!" });
    }

    // Check if course already enrolled
    const courseId = req.body.course;
    if (user.enrolledCourses.includes(courseId)) {
      logger.info("Course already enrolled:", courseId);
      return res.status(409).send({ message: "Course already enrolled!" });
    }

    // Check if the courseId exists in any other user's enrolledCourses
    const courseExists = await User.exists({ enrolledCourses: courseId });
    if (courseExists) {
      // Remove the courseId from other users' enrolledCourses
      await User.updateMany(
        { enrolledCourses: courseId },
        { $pull: { enrolledCourses: courseId } }
      );
      logger.info(
        "Removed duplicate course enrollment from other users:",
        courseId
      );
    }

    // Add course to enrolledCourses
    user.enrolledCourses.push(courseId);
    await user.save();
    logger.info("Course enrolled successfully:", courseId);

    // Note: send notification to user from here
    // axios.post('http://notification-service:1114/notifications', {
    //     userId: user._id,
    //     message: `🎉 You have successfully enrolled in a new course! 📚`
    // });

    return res.status(200).send({ message: "Course enrolled successfully!" });
  } catch (error) {
    // Error handling
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error!" });
  }
});

//post for adding enrolled courses for giver _id
router.post("/addcourse/:id", async (req, res) => {
  try {
    //validate id param as mongo id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.info("Invalid user id:", req.params.id);
      return res.status(400).send({ message: "Invalid user id!" });
    }
    //find user with given email
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logger.info("User not found:", req.body.email);
      return res.status(404).send({ message: "User not found!" });
    }
    //validate user role allow learner and admin only
    if (user.role === "learner") {
      logger.info("User not authorized to add course:", req.body.email);
      return res
        .status(403)
        .send({ message: "User not authorized to add course!" });
    }
    //add course to enrolled courses
    user.createdCourses.push(req.body.course);
    await user.save();
    logger.info("Course added successfully:", req.body.course);
    res.status(200).send({ message: "Course added successfully!" });
  } catch (error) {
    //error handling
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

//enroll to course
router.post("/enroll/:id", async (req, res) => {
  try {
    //validate id param as mongo id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.info("Invalid user id:", req.params.id);
      return res.status(400).send({ message: "Invalid user id!" });
    }
    //find user with given email
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logger.info("User not found:", req.body.email);
      return res.status(404).send({ message: "User not found!" });
    }
    //check if course already enrolled
    if (user.enrolledCourses.includes(req.body.course)) {
      logger.info("Course already enrolled:", req.body.course);
      return res.status(409).send({ message: "Course already enrolled!" });
    }
    //check duplicate object id in enrolledCourses
    if (user.enrolledCourses.some((course) => course.equals(req.body.course))) {
      logger.info("Course already enrolled:", req.body.course);
      return res.status(409).send({ message: "Course already enrolled!" });
    }
    //add course to enrolled courses
    user.enrolledCourses.push(req.body.course);
    await user.save();
    logger.info("Course enrolled successfully:", req.body.course);
    //note: send notification to user from here

    // axios.post('http://notification-service:1114/notifications', {
    //     userId: user._id,
    //     message: `🎉 You have successfully enrolled in a new course! 📚`
    // });
    res.status(200).send({ message: "Course enrolled successfully!" });
  } catch (error) {
    //error handling
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

//unenroll from course
router.delete("/enroll/:id", async (req, res) => {
  try {
    //validate id param as mongo id
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.info("Invalid user id:", req.params.id);
      return res.status(400).send({ message: "Invalid user id!" });
    }
    //find user with given email
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logger.info("User not found:", req.body.email);
      return res.status(404).send({ message: "User not found!" });
    }

    //remove course from enrolled courses
    user.enrolledCourses.pull(req.body.course);
    await user.save();
    logger.info("Course unenrolled successfully:", req.body.course);

    // note: send notification to user from here
    // axios.post('http://notification-service:1114/notifications', {
    //     userId: user._id,
    //     message: `❌ You have successfully unenrolled from a course!`
    // });

    res.status(200).send({ message: "Course unenrolled successfully!" });
  } catch (error) {
    //error handling
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

module.exports = router;
