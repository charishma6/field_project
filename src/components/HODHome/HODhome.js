import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from '../Header/header.js';
import Footer from '../Footer/footer.js';
import './HODhome.css';
import { Link } from 'react-router-dom';

const HODHome = () => {
  return (
    <div>
      <Header />
      <Container className="hod-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={4}>
          <Link to="/pending-leaves">
            <Button variant="primary" block>Leave requests</Button>
          </Link>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default HODHome;
