import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [userType, setUserType] = useState('Faculty');
  const navigate = useNavigate();

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    // Assuming login is successful
    if (userType === 'Admin') {
      navigate('/admin-home');
    } else if (userType === 'HOD') {
      navigate('/hod-home');
    } else {
      navigate('/faculty-home');
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <h1 className="text-center login-header">Login</h1>
            <Form className="login-form" onSubmit={handleLoginSubmit}>
              <Form.Group controlId="formUserType">
                <Form.Label>User Type</Form.Label>
                <Form.Control as="select" value={userType} onChange={handleUserTypeChange}>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                  <option value="HOD">HOD</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" required />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" required />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3 login-button">
                Login
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
