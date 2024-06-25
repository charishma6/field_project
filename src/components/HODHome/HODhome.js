import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from '../Header/header.js';
import Footer from '../Footer/footer.js';
import './HODhome.css';

const HODHome = () => {
  return (
    <div>
      <Header />
      <Container className="hod-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={4}>
            <Button variant="primary" block>Approve Leaves</Button>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default HODHome;
