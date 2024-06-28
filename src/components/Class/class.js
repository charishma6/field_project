import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './class.css';

const ClassBooking = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setAvailableClasses([]);

    try {
      const response = await axios.post('http://localhost:8001/faculty-api/availableClasses', {
        date,
        startTime: time,
        duration,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });

      setAvailableClasses(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('Network error. Please try again later.');
      }
    }
  };

  const handleClassBooking = async (e) => {
    e.preventDefault();
    setError('');
    setBookingSuccess(false);

    try {
      const response = await axios.post('http://localhost:8001/faculty-api/bookClass', {
        date,
        startTime: time,
        duration,
        room: selectedClass,
        section: 'Example Section', // You can change this to the actual section
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
    <Container className="class-booking-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Class Booking</h1>
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

          {availableClasses.length > 0 && (
            <div className="available-classes mt-4">
              <h2>Available Classes</h2>
              <Form onSubmit={handleClassBooking}>
                <Form.Group controlId="formClassSelect">
                  <Form.Label>Select a Class</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {availableClasses.map((cls) => (
                      <option key={cls.room} value={cls.room}>
                        {cls.room}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit" className="mt-3">
                  Book Class
                </Button>
              </Form>
            </div>
          )}

          {bookingSuccess && <Alert variant="success" className="mt-3">Class booked successfully!</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default ClassBooking;
