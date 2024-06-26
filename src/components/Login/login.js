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
      <Container fluid>
        <Row className="justify-content-center">
          <Col md={6} className="login-form-col">
            <div className="login-content">
              <h1 className="text-center login-header">BookIT</h1>
              <Form className="login-form" onSubmit={handleLoginSubmit}>
                <Form.Group controlId="formUserType">
                  <div className="user-type-options">
                    <Form.Check
                      type="radio"
                      label="Faculty"
                      name="userType"
                      value="Faculty"
                      checked={userType === 'Faculty'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                    <Form.Check
                      type="radio"
                      label="Admin"
                      name="userType"
                      value="Admin"
                      checked={userType === 'Admin'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                    <Form.Check
                      type="radio"
                      label="HOD"
                      name="userType"
                      value="HOD"
                      checked={userType === 'HOD'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                  </div>
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
                  LOGIN
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
