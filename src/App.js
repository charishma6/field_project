import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/login.js';
import FacultyHome from './components/FacultyHome/facultyhome.js';
import AdminHome from './components/AdminHome/adminhome.js';
import HODHome from './components/HODHome/HODhome.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/faculty-home" element={<FacultyHome />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/hod-home" element={<HODHome />} />
      </Routes>
    </Router>
  );
};

export default App;



