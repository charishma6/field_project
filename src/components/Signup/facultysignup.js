import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './facultysignup.css';
import axios from 'axios';

// Function to get token from local storage
const getToken = () => {
  return localStorage.getItem('token');
};

const FacultySignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    course: '',
    facultyid: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = getToken(); // Retrieve the token from local storage

      const response = await axios.post('http://localhost:8006/admin-api/create-faculty', formData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the request headers
        },
      });

      setMessage(response.data.message);
      // Redirect to admin home page after successful signup
      setTimeout(() => {
        navigate('/admin-home');
      }, 2000); // Redirect after 2 seconds

    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  return (
    <Container className="signup-container">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center signup-header">Faculty Signup</h1>
          <Form className="signup-form" onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCourse">
              <Form.Label>Course</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formFacultyId">
              <Form.Label>Faculty ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter faculty ID"
                name="facultyid"
                value={formData.facultyid}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3 signup-button">
              Signup
            </Button>
          </Form>
          {message && <p className="text-success mt-3">{message}</p>}
          {error && <p className="text-danger mt-3">{error}</p>}
        </Col>
      </Row>
    </Container>
  );
};

export default FacultySignup;


