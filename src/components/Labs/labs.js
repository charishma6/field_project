import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './labs.css';

const LabBooking = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [availableLabs, setAvailableLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setAvailableLabs([]);

    try {
      const response = await axios.post('http://localhost:8006/faculty-api/availablelabs', {
        date,
        startTime: time,
        duration,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });

      setAvailableLabs(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  const handleLabBooking = async (e) => {
    e.preventDefault();
    setError('');
    setBookingSuccess(false);

    try {
      const response = await axios.post('http://localhost:8006/faculty-api/booklab', {
        date,
        startTime: time,
        duration,
        lab: selectedLab,
        course: 'Example Course', // You can change this to the actual course
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });

      setBookingSuccess(true);
      setTimeout(() => navigate('/faculty-home'), 2000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  return (
    <Container className="lab-booking-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Lab Booking</h1>
          <Form onSubmit={handleCheckAvailability}>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formTime">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDuration">
              <Form.Label>Duration (hours)</Form.Label>
              <Form.Control
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Check Availability
            </Button>
          </Form>

          {availableLabs.length > 0 && (
            <div className="available-labs mt-4">
              <h2>Available Labs</h2>
              <Form onSubmit={handleLabBooking}>
                <Form.Group controlId="formLabSelect">
                  <Form.Label>Select a Lab</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {availableLabs.map((lab) => (
                      <option key={lab.lab} value={lab.lab}>
                        {lab.lab}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit" className="mt-3">
                  Book Lab
                </Button>
              </Form>
            </div>
          )}

          {bookingSuccess && <Alert variant="success" className="mt-3">Lab booked successfully!</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default LabBooking;
