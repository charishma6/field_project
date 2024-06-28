import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginUrl = `http://localhost:8004/${userType.toLowerCase()}-api/login`;
      console.log('Login URL:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, userType }),
      });

      const data = await response.json();
      console.log('Server Response:', data);

      if (response.ok) {
        // Save the token and user details in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate to the appropriate home page based on userType
        if (userType === 'Admin') {
          navigate('/admin-home');
        } else if (userType === 'HOD') {
          navigate('/hod-home');
        } else {
          navigate('/faculty-home');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Failed to login. Please try again.');
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
                      id="userTypeFaculty"
                      checked={userType === 'Faculty'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                    <Form.Check
                      type="radio"
                      label="Admin"
                      name="userType"
                      value="Admin"
                      id="userTypeAdmin"
                      checked={userType === 'Admin'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                    <Form.Check
                      type="radio"
                      label="HOD"
                      name="userType"
                      value="HOD"
                      id="userTypeHOD"
                      checked={userType === 'HOD'}
                      onChange={handleUserTypeChange}
                      className="user-type-radio"
                    />
                  </div>
                </Form.Group>

                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
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
