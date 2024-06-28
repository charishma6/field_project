//create admin api app
const exp = require("express");
const adminApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const verifyToken=require('../Middlewares/verifytoken')
const blacklist = new Set();

require("dotenv").config();

const cors = require('cors');
adminApp.use(cors());




let facultycollection,admincollection,hodcollection,classcollection,labscollection,timetablecollection,reassignmentscollection,bookedclassescollection,bookedlabscollection,leavescollection;

// Middleware to get facultycollection from the app instance
adminApp.use((req, res, next) => {
  facultycollection = req.app.get("facultycollection");
  admincollection = req.app.get("admincollection");
  hodcollection = req.app.get("hodcollection");
  classcollection = req.app.get("classcollection");
  labscollection = req.app.get("labscollection");
  bookedclassescollection = req.app.get("bookedclassescollection");
  bookedlabscollection = req.app.get("bookedlabscollection");
  timetablecollection = req.app.get("timetablecollection");
  leavescollection=req.app.get("leavescollection");
  reassignmentscollection=req.app.get("reassignmentscollection")
  next();
});

// admin login
/* adminApp.post(
    "/login",
    expressAsyncHandler(async (req, res) => {
      const adminCred = req.body;
      const dbadmin = await admincollection.findOne({
        username: adminCred.username,
      });
      if (dbadmin === null) {
        res.send({ message: "Invalid username" });
      } else {
        const status = await bcryptjs.compare(adminCred.password, dbadmin.password);
        if (status === false) {
          res.send({ message: "Invalid password" });
        } else {
          const signedToken = jwt.sign(
            { username: dbadmin.username },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.send({
            message: "login success",
            token: signedToken,
            user: dbadmin,
          });
        }
      }
    })
  ); */

  adminApp.post(
    "/login",
    expressAsyncHandler(async (req, res) => {
      const adminCred = req.body;
      const dbadmin = await admincollection.findOne({
        username: adminCred.username,
      });
      if (dbadmin === null) {
        res.status(400).json({ message: "Invalid username" });
      } else {
        const status = await bcryptjs.compare(adminCred.password, dbadmin.password);
        if (status === false) {
          res.status(400).json({ message: "Invalid password" });
        } else {
          const signedToken = jwt.sign(
            {
              username: dbadmin.username,
              userType: dbadmin.userType // Include userType in the token
            },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.status(200).json({
            message: "login success",
            token: signedToken,
            user: {
              username: dbadmin.username,
              userType: dbadmin.userType // Include userType in the response
            },
          });
        }
      }
    })
  );


// Logout endpoint
adminApp.post('/logout', verifyToken, expressAsyncHandler(async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  blacklist.add(token);
  res.status(200).json({ message: 'Logout successful' });
}))

/* //middleware
  const verifyAdmin = (req, res, next) => {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform this action.' });
    }
    next();
  };
   */




// Endpoint to create a new faculty account
adminApp.post('/create-faculty',verifyToken, expressAsyncHandler(async (req, res) => {
  const { username, password, name, email, course, facultyid } = req.body;

  if (!username || !password || !name || !email || !course || !facultyid) {
    return res.status(400).json({ message: 'Username, password, name, email, course, and faculty ID are required' });
  }

  // Check if the faculty ID already exists
  const existingFaculty = await facultycollection.findOne({ facultyid });
  if (existingFaculty) {
    return res.status(409).json({ message: 'Faculty ID already exists' });
  }

  // Hash the password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create new faculty object
  const newFaculty = {
    userType: 'Faculty',
    username,
    password: hashedPassword,
    name,
    email,
    course,
    facultyid,
    dateCreated: new Date()
  };

  // Insert new faculty into the collection
  await facultycollection.insertOne(newFaculty);

  res.status(201).json({ message: 'Faculty account created successfully', newFaculty });
}));

//addclass

adminApp.post('/add-class', verifyToken, expressAsyncHandler(async (req, res) => {
  const { room } = req.body;

  if (!room) {
    return res.status(400).json({ message: 'Room is required' });
  }

  const newClass = { room };
  await classcollection.insertOne(newClass);

  res.status(201).json({ message: 'Class added successfully', newClass });
}));

//add lab

adminApp.post('/add-lab', verifyToken, expressAsyncHandler(async (req, res) => {
  const { lab } = req.body;

  if (!lab) {
    return res.status(400).json({ message: 'Lab is required' });
  }

  const newLab = { lab };
  await labscollection.insertOne(newLab);

  res.status(201).json({ message: 'Lab added successfully', newLab });
}));


//update timetable
/* adminApp.put('/update-timetable', verifyToken, expressAsyncHandler(async (req, res) => {
  const { day, section, timeSlot, course, room, booked, bookedBy, lab } = req.body;

  if (!day || !section || !timeSlot || (!course && !lab) || !booked || !bookedBy) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const updateQuery = lab ? { lab, booked, bookedBy } : { course, room, booked, bookedBy };

  const result = await timetablecollection.updateOne(
    { day, [`sections.${section}.timeSlot`]: timeSlot },
    { $set: { [`sections.${section}.$`]: updateQuery } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Timetable entry not found' });
  }

  res.status(200).json({ message: 'Timetable updated successfully' });
})); */

//export userApp
module.exports = adminApp;