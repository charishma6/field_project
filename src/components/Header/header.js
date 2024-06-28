import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './header.css'; // Import the CSS file
import { Link } from 'react-router-dom';

const Header = () => {
  const handleLogout = () => {
    // Implement your logout logic here
    // Example: clear session, redirect to login page, etc.
    console.log('Logout clicked');
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to="/">BookIT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
      
