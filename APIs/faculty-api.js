const express = require("express");
const facultyApp = express.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
/* const crypto = require("crypto");
const nodemailer = require("nodemailer"); */
const verifyToken=require('../Middlewares/verifytoken')
const blacklist = new Set();

const cors = require('cors');
facultyApp.use(cors());

require("dotenv").config();



let facultycollection,classcollection,labscollection,timetablecollection,reassignmentscollection,bookedclassescollection,bookedlabscollection,leavescollection;

// Middleware to get facultycollection from the app instance
facultyApp.use((req, res, next) => {
  facultycollection = req.app.get("facultycollection");
  classcollection = req.app.get("classcollection");
  labscollection = req.app.get("labscollection");
  bookedclassescollection = req.app.get("bookedclassescollection");
  bookedlabscollection = req.app.get("bookedlabscollection");
  timetablecollection = req.app.get("timetablecollection");
  leavescollection=req.app.get("leavescollection");
  reassignmentscollection=req.app.get("reassignmentscollection")
  next();
});

/* // Function to send password reset email
const sendPasswordResetEmail = async (email, token) => {
  // Create a transporter object using the default SMTP transport
 try{ const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // List of recipients
    subject: 'Password Reset', // Subject line
    text: `You requested a password reset. Use this token to reset your password: ${token}`, // Plain text body
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  console.log('Password reset email sent successfully');
} catch (error) {
  console.error('Error sending password reset email:', error);
  throw new Error('Error sending password reset email');
}
}; */

// Faculty login
facultyApp.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    try {
      const { username, password, userType } = req.body;
      console.log('Login request received for:', username, 'with userType:', userType);

      if (!username || !password || !userType) {
        return res.status(400).json({ message: 'username,password,userType are required' });
      }

      const dbfaculty = await facultycollection.findOne({ username });
      if (!dbfaculty) {
        console.log('Invalid username');
        res.status(400).send({ message: 'Invalid username' });
        return;
      }

      const passwordMatches = await bcryptjs.compare(password, dbfaculty.password);
      if (!passwordMatches) {
        console.log('Invalid password');
        res.status(400).send({ message: 'Invalid password' });
        return;
      }

      const signedToken = jwt.sign(
        { username: dbfaculty.username, facultyid: dbfaculty.facultyid },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.send({
        message: 'Login success',
        token: signedToken,
        user: dbfaculty,
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

// Logout endpoint
facultyApp.post('/logout', verifyToken, expressAsyncHandler(async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  blacklist.add(token);
  res.status(200).json({ message: 'Logout successful' });
}));

/* // Password reset request
facultyApp.post("/forgot-password", expressAsyncHandler(async (req, res) => {
  const user = await facultycollection.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate password reset token
  let resetToken;
  try {
    resetToken = crypto.randomBytes(32).toString("hex");
  } catch (err) {
    console.error("Error generating reset token:", err);
    return res.status(500).json({ message: "Error generating reset token" });
  }

  // Update user with reset token
  try {
    await facultycollection.updateOne({ email: req.body.email }, { $set: { resetToken } });
  } catch (err) {
    console.error("Error updating user with reset token:", err);
    return res.status(500).json({ message: "Error updating user with reset token" });
  }

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error sending password reset email:", err);
    res.status(500).json({ message: "Error sending password reset email" });
  }
})); */

/* // Password reset
facultyApp.post("/reset-password", expressAsyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const user = await facultycollection.findOne({ resetToken });
  if (!user) {
    return res.status(404).json({ message: "Invalid reset token" });
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  await facultycollection.updateOne({ resetToken }, { $set: { password: hashedPassword, resetToken: undefined } });
  res.json({ message: "Password reset successfully" });
})); */


// Helper function to get the day of the week from a date
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper function to convert 12-hour time to 24-hour format
const convertTimeTo24Hrs = (time12h) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

// Helper function to convert 24-hour time to 12-hour time
const convertTimeTo12Hrs = (time24) => {
  const [hour, minute] = time24.split(':');
  const hour12 = (hour % 12) || 12;
  const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
  return `${hour12}:${minute} ${ampm}`;
};


// LABS


// Get available labs for a specific date and timeslot
facultyApp.post('/availablelabs', verifyToken,async (req, res) => {
  const { date, startTime, duration } = req.body;

  if (!date || !startTime || !duration) {
   return res.status(400).json({ message: 'Date, startTime, and duration are required' });
  }

  // Get the day of the week from the date
  const dayOfWeek = getDayOfWeek(date);

  // Fetch all labs for the department
  try{
  const all_labs = await labscollection.find().toArray();
  console.log('All labs:', all_labs);


 // Fetch all bookings for the specific date
  const specific_Bookings = await bookedlabscollection.find({ date }).toArray();
  console.log('Specific bookings for date:', specific_Bookings);
 

  // Fetch all bookings for the specific day
  const timetable = await timetablecollection.findOne({ day: dayOfWeek });
  console.log('Timetable for day:', dayOfWeek, timetable);


  const bookedlabs = new Set();

   // Process specific date bookings
   specific_Bookings.forEach(booking => {
    const bookingStartTime = new Date(`${date}T${booking.startTime}`);
    const bookingEndTime = new Date(bookingStartTime.getTime() + booking.duration * 60 * 60 * 1000);

    const timeslotStartTime = new Date(`${date}T${startTime}`);
    const timeslotEndTime = new Date(timeslotStartTime.getTime() + duration * 60 * 60 * 1000);

    if ((timeslotStartTime >= bookingStartTime && timeslotStartTime < bookingEndTime) ||
        (timeslotEndTime > bookingStartTime && timeslotEndTime <= bookingEndTime)) {
      bookedlabs.add(booking.lab);
    }
  });

  if (timetable) {
    Object.keys(timetable.sections).forEach(section => {
      timetable.sections[section].forEach(booking => {
        // Assuming booking has a start time and duration
        if (booking.timeSlot && booking.lab) {
        const [bookingStart, bookingEnd] = booking.timeSlot.split(' - ');
        const bookingStartTime = new Date(`${date}T${convertTimeTo24Hrs(bookingStart)}`);
        const bookingEndTime = new Date(`${date}T${convertTimeTo24Hrs(bookingEnd)}`);

        const timeslotStartTime = new Date(`${date}T${startTime}`);
        const timeslotEndTime = new Date(timeslotStartTime.getTime() + duration * 60 * 60 * 1000); // duration in hours

        if ((timeslotStartTime < bookingEndTime && timeslotEndTime > bookingStartTime)) {
          bookedlabs.add(booking.lab);
        }
        }
      });
    });
  }


  // Filter available labs
  const availablelabs = all_labs.filter(lab => !bookedlabs.has(lab.lab));

  res.json(availablelabs);
}
catch(error)
{
  console.error('Error fetching available labs',error);
  res.status(500).json({ message: 'Error fetching available labs', error });}
});

//book lab
facultyApp.post('/booklab', verifyToken,async (req, res) => {
  const { date, startTime, duration, lab ,course } = req.body;

  if (!date || !startTime || !duration || !lab || !course) {
    return res.status(400).json({ message: 'Date, startTime, duration, lab, and course are required' });
  }

  
  try {

    // Check if the lab is already booked for the specified date and time slot
const existingBooking = await bookedlabscollection.findOne({ date, startTime, duration, lab , course });

if (existingBooking) {
  return res.status(409).json({ message: 'Lab already booked for the specified date and time slot' });
}

    const booking = {
      date,
      startTime,
      duration,
      lab,
      course,
     // bookedBy: req.user ? req.user.id : 'unknown' // Assuming `auth` middleware adds `req.user`
    };

    await bookedlabscollection.insertOne(booking);

    res.status(201).json({ message: 'lab booked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking lab', error });
  }
});


//CLASSES

// Get available classes for a specific date and timeslot
facultyApp.post('/availableClasses', verifyToken,async (req, res) => {
  const { date, startTime, duration } = req.body;

  if (!date || !startTime || !duration) {
   return res.status(400).json({ message: 'Date, startTime, and duration are required' });
  }

  // Get the day of the week from the date
  const dayOfWeek = getDayOfWeek(date);

  // Fetch all classes for the department
  try{
  const allClasses = await classcollection.find().toArray();
  

   // Fetch all bookings for the specific date
   const specificBookings = await bookedclassescollection.find({ date }).toArray();
   

  // Fetch all bookings for the specific day
  const timetable = await timetablecollection.findOne({ day: dayOfWeek });
  

  const bookedRooms = [];

   // Process specific date bookings
   specificBookings.forEach(booking => {
    const bookingStartTime = new Date(`${date}T${booking.startTime}`);
    const bookingEndTime = new Date(bookingStartTime.getTime() + booking.duration * 60 * 60 * 1000);

    const timeslotStartTime = new Date(`${date}T${startTime}`);
    const timeslotEndTime = new Date(timeslotStartTime.getTime() + duration * 60 * 60 * 1000);

    if ((timeslotStartTime >= bookingStartTime && timeslotStartTime < bookingEndTime) ||
        (timeslotEndTime > bookingStartTime && timeslotEndTime <= bookingEndTime)) {
      bookedRooms.push(booking.room);
    }
  });

  if (timetable) {
    Object.keys(timetable.sections).forEach(section => {
      timetable.sections[section].forEach(booking => {
        // Assuming booking has a start time and duration
        const [bookingStart, bookingEnd] = booking.timeSlot.split(' - ');
        const bookingStartTime = new Date(`${date}T${convertTimeTo24Hrs(bookingStart)}`);
        const bookingEndTime = new Date(`${date}T${convertTimeTo24Hrs(bookingEnd)}`);

        const timeslotStartTime = new Date(`${date}T${startTime}`);
        const timeslotEndTime = new Date(timeslotStartTime.getTime() + duration * 60 * 60 * 1000); // duration in hours

        if ((timeslotStartTime < bookingEndTime && timeslotEndTime > bookingStartTime)) {
          bookedRooms.push(booking.room);
        }
      });
    });
  }


  // Filter available classes
  const availableClasses = allClasses.filter(cls => !bookedRooms.includes(cls.room));

  res.json(availableClasses);
}
catch(error)
{
  console.error('Error fetching available classes',error);
  res.status(500).json({ message: 'Error fetching available classes', error });}
});

//book class
facultyApp.post('/bookClass',verifyToken, async (req, res) => {
  const { date, startTime, duration, room, section, course } = req.body;

  if (!date || !startTime || !duration || !room || !section || !course) {
    return res.status(400).json({ message: 'Date, startTime, duration, room, section, and course are required' });
  }

  
  try {

    // Check if the class is already booked for the specified date and time slot
const existingBooking = await bookedclassescollection.findOne({ date, startTime, duration, room, section, course });

if (existingBooking) {
  return res.status(409).json({ message: 'Class already booked for the specified date and time slot' });
}

    const booking = {
      date,
      startTime,
      duration,
      room,
      section,
      course,
     // bookedBy: req.user ? req.user.id : 'unknown' // Assuming `auth` middleware adds `req.user`
    };

    await bookedclassescollection.insertOne(booking);

    res.status(201).json({ message: 'Class booked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking class', error });
  }
});


//apply for leave


// Check availability for leave dates
// Endpoint to check leave availability
facultyApp.post('/checkavailability',verifyToken, async (req, res) => {
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
      return res.status(400).json({ message: 'fromDate and toDate are required' });
  }

  // Convert dates to a comparable format
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const facultyId = req.user.facultyid; // Extracted from the verified token

  if (start > end) {
      return res.status(400).json({ message: 'fromDate cannot be after toDate' });
  }

  // Check each date in the range for availability
  let date = new Date(start);
  const unavailableDates = [];

  while (date <= end) {
      const formattedDate = date.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
      const leaveCount = await leavescollection.countDocuments({ fromDate: { $lte: formattedDate }, toDate: { $gte: formattedDate } });

      if (leaveCount >= 4) {
          unavailableDates.push(formattedDate);
      }

      // Move to the next day
      date.setDate(date.getDate() + 1);
  }

  if (unavailableDates.length > 0) {
      return res.status(409).json({ message: `No available leave slots for the following dates: ${unavailableDates.join(', ')} try again later!` });
  }

  res.status(200).json({ message: 'Slots available for all requested dates' });
}); 

/* facultyApp.post('/checkavailability', verifyToken, async (req, res) => {
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: 'fromDate and toDate are required' });
  }

  // Convert dates to a comparable format
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const facultyId = req.user.facultyid; // Extracted from the verified token

  if (start > end) {
    return res.status(400).json({ message: 'fromDate cannot be after toDate' });
  }

  try {
    // Check each date in the range for availability
    const datesToCheck = [];
    let date = new Date(start);

    while (date <= end) {
      datesToCheck.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    // Query database concurrently for all dates
    const availabilityChecks = datesToCheck.map(async (date) => {
      const formattedDate = date.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
      const leaveCount = await leavescollection.countDocuments({
        fromDate: { $lte: formattedDate },
        toDate: { $gte: formattedDate }
      });

      return { date: formattedDate, leaveCount };
    });

    const results = await Promise.all(availabilityChecks);
    const unavailableDates = results
      .filter(result => result.leaveCount >= 4)
      .map(result => result.date);

    if (unavailableDates.length > 0) {
      return res.status(409).json({ message: `No available leave slots for the following dates: ${unavailableDates.join(', ')}. Please try again later!` });
    }

    res.status(200).json({ message: 'Slots available for all requested dates' });
  } catch (error) {
    console.error('Error checking leave availability:', error);
    res.status(500).json({ message: 'An error occurred while checking leave availability' });
  }
});
 */

//adjustments
facultyApp.post('/adjustments', verifyToken, expressAsyncHandler(async (req, res) => {
  const { fromDate, toDate, reason } = req.body;

  if (!fromDate || !toDate || !reason) {
    return res.status(400).json({ message: 'fromDate, toDate, and reason are required' });
  }

  const facultyId = req.user.facultyid; // Extract faculty ID from JWT token
  console.log(`Faculty ID: ${facultyId}`);

  const start = new Date(fromDate);
  const end = new Date(toDate);

  let date = new Date(start);
  const classesToAdjust = [];

  while (date <= end) {
    const formattedDate = date.toISOString().split('T')[0];
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

    console.log(`Checking schedule for date: ${formattedDate}, day: ${dayOfWeek}`);

    const schedule = await timetablecollection.findOne({ day: dayOfWeek });
    if (schedule) {
      console.log(`Schedule found for day: ${dayOfWeek}`, schedule.sections);

      for (const section in schedule.sections) {
        const classes = schedule.sections[section].filter(c => c.bookedBy === facultyId);
        console.log(`Classes for facultyId ${facultyId} in section ${section}:`, classes);
        classesToAdjust.push(...classes.map(c => ({ ...c, date: formattedDate, section })));
      }
    } else {
      console.log(`No schedule found for day: ${dayOfWeek}`);
    }

    date.setDate(date.getDate() + 1);
  }

  if (classesToAdjust.length === 0) {
    return res.status(200).json({ message: 'You don\'t have any classes', canSubmit: true });
  }

  res.status(200).json({ classesToAdjust });
}));

//get free facutly
// Function to parse time slot and return start and end times
function parseTimeSlot(timeSlot) {
  const [start, end] = timeSlot.split(' - ');
  return [parseTime(start), parseTime(end)];
}

// Function to parse time and return Date object
function parseTime(timeString) {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) {
      hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
      hours = 0;
  }
  return new Date(`2000-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
}

facultyApp.post('/available-faculty', verifyToken, expressAsyncHandler(async (req, res) => {
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) {
      return res.status(400).json({ message: 'date and timeSlot are required' });
  }

  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));

  const schedule = await timetablecollection.findOne({ day: dayOfWeek });
  if (!schedule) {
      return res.status(404).json({ message: 'No schedule found for the specified day' });
  }

  const allFaculty = await facultycollection.find({}).toArray();

  const bookedFacultyIds = [];

  const [startTime, endTime] = parseTimeSlot(timeSlot);

  for (const section in schedule.sections) {
      const classes = schedule.sections[section].filter(c => {
          const classStartTime = parseTimeSlot(c.timeSlot)[0];
          const classEndTime = parseTimeSlot(c.timeSlot)[1];
          return !(endTime <= classStartTime || startTime >= classEndTime) && c.booked;
      });
      classes.forEach(cls => {
          if (!bookedFacultyIds.includes(cls.bookedBy)) {
              bookedFacultyIds.push(cls.bookedBy);
          }
      });
  }

  const availableFaculty = allFaculty.filter(faculty => !bookedFacultyIds.includes(faculty.facultyid));

  res.status(200).json({ availableFaculty });
}));

//reasssigning
facultyApp.post('/reassign-classes', verifyToken, expressAsyncHandler(async (req, res) => {
  const { reassignments } = req.body; // reassignments is an array of { classDetails, newFacultyId }

  if (!reassignments || reassignments.length === 0) {
    return res.status(400).json({ message: 'Reassignments are required' });
  }

  const reassignmentDoc = {
    reassignedBy: req.user.facultyid,
    date: new Date(),
    reassignments: reassignments.map(({ classDetails, newFacultyId }) => ({
      originalClass: classDetails,
      newFacultyId: newFacultyId,
      reassignedDate: classDetails.date,
      status: "assigned" // Ensure this status is set to 'assigned'
    }))
  };

  await reassignmentscollection.insertOne(reassignmentDoc);

  res.status(200).json({ message: 'Classes successfully reassigned', reassignmentDoc });
}));

//send leave request to HOD
facultyApp.post('/send-leave-request', verifyToken, expressAsyncHandler(async (req, res) => {
  const { reason, fromDate, toDate } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({ message: 'Reason, startDate, and endDate are required' });
  }

  const leaveRequest = {
    facultyId: req.user.facultyid,
    reason: reason,
    startDate: new Date(fromDate),
    endDate: new Date(toDate),
    status: 'pending',
    dateSubmitted: new Date(),
    //reassignedClasses: [] // Will store reassigned classes details
  };

   try {
   /*  // Get reassigned classes for the faculty
    const reassignedClasses = await reassignmentscollection.find({
      "reassignments.newFacultyId": req.user.facultyid,
      "reassignments.status": 'assigned'
    }).toArray();

    // Debugging: Log the reassigned classes
    console.log('Reassigned classes found:', reassignedClasses);

    // Populate reassignedClasses in leave request
    leaveRequest.reassignedClasses = reassignedClasses.flatMap(doc =>
      doc.reassignments.filter(item => item.newFacultyId === req.user.facultyid && item.status === 'assigned')
    );

    // Debugging: Log the filtered reassigned classes
    console.log('Filtered reassigned classes:', leaveRequest.reassignedClasses); */ 

    // Insert the leave request into the collection
    await leavescollection.insertOne(leaveRequest);

    res.status(200).json({ message: 'Leave request submitted to HOD', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while submitting the leave request', error });
  }
}));



//if anyone extra class is assigned by any faculty while applying leave
//notifcations
facultyApp.get('/notifications', verifyToken, expressAsyncHandler(async (req, res) => {
  const facultyId = req.user.facultyid;

  console.log('Faculty ID:', facultyId); // Log the faculty ID for debugging

  const notifications = await reassignmentsCollection.find({
    "reassignments.newFacultyId": facultyId,
    "reassignments.status": 'assigned' // Assuming status is 'assigned' for new assignments
  }).toArray();

  const filteredNotifications = notifications.flatMap(doc => 
    doc.reassignments
      .filter(item => item.newFacultyId === facultyId && item.status === 'assigned')
      .map(item => ({
        mainId: doc._id,
        reassignedBy: doc.reassignedBy,
        date: doc.date,
        ...item
      }))
  );

  console.log('Filtered Notifications:', filteredNotifications); // Log the result for debugging

  res.status(200).json(filteredNotifications);
}));


/* //accept/decline
facultyApp.post('/respond-assignment', verifyToken, expressAsyncHandler(async (req, res) => {
  const { newFacultyId, originalClass, response } = req.body; // newFacultyId and originalClass identify the reassignment

  if (!newFacultyId || !originalClass || !response) {
    return res.status(400).json({ message: 'newFacultyId, originalClass, and response are required' });
  }

  const filter = {
    "reassignments": {
      $elemMatch: {
        "newFacultyId": newFacultyId,
        "originalClass.course": originalClass.course,
        "originalClass.date": originalClass.date,
        "originalClass.timeSlot": originalClass.timeSlot,
        "status": 'pending'
      }
    }
  };

  const update = {
    $set: { "reassignments.$[elem].status": response }
  };

  const options = {
    arrayFilters: [
      {
        "elem.newFacultyId": newFacultyId,
        "elem.originalClass.course": originalClass.course,
        "elem.originalClass.date": originalClass.date,
        "elem.originalClass.timeSlot": originalClass.timeSlot,
        "elem.status": 'pending'
      }
    ]
  };

  try {
    const updateResult = await reassignmentscollection.updateOne(filter, update, options);

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Pending assignment not found for specified details' });
    }

    res.status(200).json({ message: `Assignment ${response} successfully` });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
}));


facultyApp.post('/forward-leave-to-hod', verifyToken, expressAsyncHandler(async (req, res) => {
  const { reassignmentId, fromDate, toDate, reason } = req.body;

  if (!reassignmentId || !fromDate || !toDate || !reason) {
    return res.status(400).json({ message: 'reassignmentId, fromDate, toDate, and reason are required' });
  }

  try {
    const reassignmentDoc = await reassignmentscollection.findOne({ _id: new ObjectId(reassignmentId) });

    if (!reassignmentDoc) {
      return res.status(404).json({ message: 'Reassignment document not found' });
    }

    const allAccepted = reassignmentDoc.reassignments.every(r => r.status === 'accepted');

    if (allAccepted) {
      const leaveRequest = {
        facultyId: reassignmentDoc.reassignedBy,
        fromDate,
        toDate,
        reason,
        status: 'pending HOD approval'
      };

      await leavescollection.insertOne(leaveRequest);
      res.status(200).json({ message: 'Leave request forwarded to HOD' });
    } else {
      res.status(400).json({ message: 'Not all reassignments have been accepted yet' });
    }
  } catch (error) {
    console.error('Error forwarding leave request:', error);
    res.status(500).json({ message: 'Error forwarding leave request', error: error.message });
  }
}));

 */

// Export facultyApp
module.exports = facultyApp;

