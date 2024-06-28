import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Function to get token from local storage
const getToken = () => {
  return localStorage.getItem('token');
};

const AddLab = () => {
  const [lab, setLab] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = getToken(); // Retrieve the token from local storage

      const response = await axios.post(
        'http://localhost:8006/admin-api/add-lab',
        { lab },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      setMessage(response.data.message);
      // Redirect to admin home page after a short delay
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
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="text-center">Add Lab</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formLab">
              <Form.Label>Lab</Form.Label>
              <Form.Control
                type="text"
                value={lab}
                onChange={(e) => setLab(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Add Lab
            </Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default AddLab;

