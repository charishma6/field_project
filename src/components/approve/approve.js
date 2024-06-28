import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import './approve.css'; // Ensure you have your CSS file

const PendingLeaves = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const response = await axios.get('http://localhost:8004/hod-api/pending-leaves');
        setPendingLeaves(response.data);
      } catch (error) {
        setError('Failed to fetch pending leaves');
      }
    };

    fetchPendingLeaves();
  }, []);

  const handleAcceptLeave = async (leave) => {
    try {
      const response = await axios.post('http://localhost:8004/hod-api/accept-leave', {
        facultyId: leave.facultyId,
        startDate: leave.startDate,
        endDate: leave.endDate
      });
      setMessage(response.data.message);
      setPendingLeaves(pendingLeaves.filter(l => l._id !== leave._id));
    } catch (error) {
      setError('Failed to accept leave request');
    }
  };

  const handleRejectLeave = async (leave) => {
    try {
      const response = await axios.post('http://localhost:8004/hod-api/reject-leave', {
        facultyId: leave.facultyId,
        startDate: leave.startDate,
        endDate: leave.endDate
      });
      setMessage(response.data.message);
      setPendingLeaves(pendingLeaves.filter(l => l._id !== leave._id));
    } catch (error) {
      setError('Failed to reject leave request');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Pending Leave Requests</h1>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {pendingLeaves.length === 0 ? (
            <Alert variant="info">No pending leave requests</Alert>
          ) : (
            pendingLeaves.map((leave) => (
              <div key={leave._id} className="leave-request">
                <p>
                  <strong>Faculty ID:</strong> {leave.facultyId}<br />
                  <strong>Reason:</strong> {leave.reason}<br />
                  <strong>From:</strong> {new Date(leave.startDate).toLocaleDateString()}<br />
                  <strong>To:</strong> {new Date(leave.endDate).toLocaleDateString()}<br />
                  <strong>Status:</strong> {leave.status}
                </p>
                <Button variant="success" onClick={() => handleAcceptLeave(leave)}>Accept</Button>
                <Button variant="danger" className="ml-2" onClick={() => handleRejectLeave(leave)}>Reject</Button>
                <hr />
              </div>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PendingLeaves;
