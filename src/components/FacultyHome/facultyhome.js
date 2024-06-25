import React, { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Header from '../Header/header';
import Footer from '../Footer/footer';
import './facultyhome.css';

const FacultyHome = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'You have been assigned to teach Math 101', accepted: null },
    { id: 2, message: 'You have been assigned to Lab C202', accepted: null }
  ]);

  const handleAccept = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, accepted: true } : notification
    ));
  };

  const handleDecline = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, accepted: false } : notification
    ));
  };

  return (
    <div>
      <Header />
      <Container className="faculty-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={3}>
            <Button variant="primary" block>Book a Class</Button>
          </Col>
          <Col md={3}>
            <Button variant="primary" block>Book a Lab</Button>
          </Col>
          <Col md={3}>
            <Button variant="primary" block>Leave Booking</Button>
          </Col>
        </Row>
        <Row className="justify-content-md-center mt-5">
          <Col md={8}>
            <h3>Notifications</h3>
            {notifications.map(notification => (
              <Card className="mb-3" key={notification.id}>
                <Card.Body>
                  <Card.Text>{notification.message}</Card.Text>
                  {notification.accepted === null ? (
                    <>
                      <Button variant="success" onClick={() => handleAccept(notification.id)}>Accept</Button>
                      <Button variant="danger" className="ml-2" onClick={() => handleDecline(notification.id)}>Decline</Button>
                    </>
                  ) : (
                    <Card.Text>{notification.accepted ? "Accepted" : "Declined"}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default FacultyHome;
