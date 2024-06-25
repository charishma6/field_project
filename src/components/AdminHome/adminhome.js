import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from '../Header/header';
import Footer from '../Footer/footer';
import './adminhome.css';

const AdminHome = () => {
  return (
    <div>
      <Header />
      <Container className="admin-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={4}>
            <Button variant="primary" block>Create Faculty Account</Button>
          </Col>
          <Col md={4}>
            <Button variant="primary" block>Update Databases</Button>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default AdminHome;

