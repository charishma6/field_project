//create hod api app
const exp = require("express");
const hodApp = exp.Router();
const verifyToken=require('../Middlewares/verifytoken')
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const blacklist = new Set();

const cors = require('cors');
hodApp.use(cors());

require("dotenv").config();



let facultycollection,hodcollection,classcollection,labscollection,timetablecollection,reassignmentscollection,bookedclassescollection,bookedlabscollection,leavescollection;

// Middleware to get facultycollection from the app instance
hodApp.use((req, res, next) => {
  facultycollection = req.app.get("facultycollection");
  hodcollection=req.app.get("hodcollection");
  classcollection = req.app.get("classcollection");
  labscollection = req.app.get("labscollection");
  bookedclassescollection = req.app.get("bookedclassescollection");
  bookedlabscollection = req.app.get("bookedlabscollection");
  timetablecollection = req.app.get("timetablecollection");
  leavescollection=req.app.get("leavescollection");
  reassignmentscollection=req.app.get("reassignmentscollection")
  next();
});

// hod login
/* hodApp.post(
    "/login",
    expressAsyncHandler(async (req, res) => {
      const hodCred = req.body;
      const dbhod = await hodcollection.findOne({
        username: hodCred.username,
      });
      if (dbhod === null) {
        res.send({ message: "Invalid username" });
      } else {
        const status = await bcryptjs.compare(hodCred.password, dbhod.password);
        if (status === false) {
          res.send({ message: "Invalid password" });
        } else {
          const signedToken = jwt.sign(
            { username: dbhod.username },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.send({
            message: "login success",
            token: signedToken,
            user: dbhod,
          });
        }
      }
    })
  );
 */
  hodApp.post(
    "/login",
    expressAsyncHandler(async (req, res) => {
      const hodCred = req.body;
      const dbhod = await hodcollection.findOne({
        username: hodCred.username,
      });
      if (dbhod === null) {
        res.send({ message: "Invalid username" });
      } else {
        const status = await bcryptjs.compare(hodCred.password, dbhod.password);
        if (status === false) {
          res.send({ message: "Invalid password" });
        } else {
          const signedToken = jwt.sign(
            { username: dbhod.username, userType: 'HOD' }, // Include userType in the token
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.send({
            message: "login success",
            token: signedToken,
            user: dbhod,
          });
        }
      }
    })
  );

  // Logout endpoint
hodApp.post('/logout', verifyToken, expressAsyncHandler(async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  blacklist.add(token);
  res.status(200).json({ message: 'Logout successful' });
}));

// Fetch all pending leave requests
hodApp.get('/pending-leaves', verifyToken, expressAsyncHandler(async (req, res) => {
  const pendingLeaves = await leavescollection.find({ status: 'pending' }).toArray();
  res.status(200).json(pendingLeaves);
}));

// Accept leave request
hodApp.post(
  "/accept-leave",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    const { facultyId, startDate, endDate } = req.body;

    if (!facultyId || !startDate || !endDate) {
      return res.status(400).json({ message: "facultyId, startDate, and endDate are required" });
    }

    const result = await leavescollection.updateOne(
      { facultyId, startDate: new Date(startDate), endDate: new Date(endDate), status: 'pending' },
      { $set: { status: "accepted" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Leave request not found or already processed" });
    }

    res.status(200).json({ message: "Leave request accepted" });
  })
);

// Reject leave request
hodApp.post(
  "/reject-leave",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    const { facultyId, startDate, endDate } = req.body;

    if (!facultyId || !startDate || !endDate) {
      return res.status(400).json({ message: "facultyId, startDate, and endDate are required" });
    }

    const result = await leavescollection.updateOne(
      { facultyId, startDate: new Date(startDate), endDate: new Date(endDate), status: 'pending' },
      { $set: { status: "rejected" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Leave request not found or already processed" });
    }

    res.status(200).json({ message: "Leave request rejected" });
  })
);


//export userApp
module.exports = hodApp;