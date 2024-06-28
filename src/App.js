import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/login.js'
import FacultyHome from './components/FacultyHome/facultyhome.js';
import AdminHome from './components/AdminHome/adminhome.js';
import HODHome from './components/HODHome/HODhome.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import LabBooking from './components/Labs/labs.js';
import BookClass from './components/Class/class.js';
import BookLeave from './components/leavebooking/leavebooking.js'
import FacultySignup from './components/Signup/facultysignup.js';
import AddClass from './components/Addclass/Addclass.js';
import AddLab from './components/Addlab/Addlab.js';
import PendingLeaves from './components/approve/approve.js';


const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login/>} />
        <Route path="/faculty-home" element={<FacultyHome />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/hod-home" element={<HODHome />} />
        <Route path="/book-lab" element={<LabBooking />} />
        <Route path="/book-class" element={<BookClass />} />
        <Route path="/book-leave" element={<BookLeave />} />
        <Route path="/create-faculty" element={<FacultySignup />} />
        <Route path="/add-class" element={<AddClass />} />
        <Route path="/add-lab" element={<AddLab />} />
        <Route path="/pending-leaves" element={<PendingLeaves/>} />

      </Routes>
    </Router>

  );
};

export default App;



