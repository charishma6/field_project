import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from '../Header/header';
import Footer from '../Footer/footer';
import './adminhome.css';
import {Link} from 'react-router-dom';

const AdminHome = () => {
  return (
    <div>
      <Header />
      <Container className="admin-home-container">
        <Row className="justify-content-md-center mt-5">
          <Col md={4}>
          <Link to="/create-faculty">
            <Button variant="primary" block>Create Faculty Account</Button>
          </Link>
          </Col>
          <Col md={4}>
          <Link to="/add-class">
            <Button variant="primary" block>Add a class</Button>
            </Link>
          </Col>
          <Col md={4}>
          <Link to="/add-lab">
            <Button variant="primary" block>Add a lab</Button>
            </Link>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default AdminHome;


