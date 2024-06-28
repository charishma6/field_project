import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Header from '../Header/header.js';
import Footer from '../Footer/footer.js';
import './facultyhome.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FacultyHome = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8004/faculty-api/notifications');
        setNotifications(response.data);
      } catch (error) {
        setError('Failed to fetch notifications');
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <Header />
      <Container className="faculty-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={3}>
            <Link to="/book-class">
              <Button variant="primary" block>Book a Class</Button>
            </Link>
          </Col>
          <Col md={3}>
            <Link to="/book-lab">
              <Button variant="primary" block>Book a Lab</Button>
            </Link>
          </Col>
          <Col md={3}>
            <Link to="/book-leave">
              <Button variant="primary" block>Leave Booking</Button>
            </Link>
          </Col>
        </Row>
        {<Row className="mt-5">
          <Col>
            <h2>Notifications</h2>
            {error && <p className="text-danger">{error}</p>}
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.mainId} className="mb-3">
                  <Card.Body>
                    {`You have been assigned to teach ${notification.classDetails.className} on ${notification.date} at ${notification.classDetails.timeSlot}`}
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No new notifications.</p>
            )}
          </Col>
        </Row> }
      </Container>
      <Footer />
    </div>
  );
};

export default FacultyHome;
