/* import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './leavebooking.css';

// Set up Axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const BookLeave = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [adjustments, setAdjustments] = useState([]);
  const [reassignments, setReassignments] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState({});
  const [selectedFaculty, setSelectedFaculty] = useState({});
  const navigate = useNavigate();

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setAvailabilityMessage('');
    setAdjustments([]);

    try {
      const response = await axios.post('http://localhost:8005/faculty-api/checkavailability', { fromDate, toDate });
      setAvailabilityMessage(response.data.message);

      // Save token to local storage (if applicable)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      if (response.data.message.includes('Slots available')) {
        await fetchAdjustments();
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const fetchAdjustments = async () => {
    try {
      const response = await axios.post('http://localhost:8005/faculty-api/adjustments', { fromDate, toDate, reason });
      setAdjustments(response.data.classesToAdjust);
      await fetchAvailableFaculty(response.data.classesToAdjust);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const fetchAvailableFaculty = async (classesToAdjust) => {
    const facultyAvailability = {};

    for (const adjustment of classesToAdjust) {
      try {
        const response = await axios.post('http://localhost:8004/faculty-api/available-faculty', {
          date: adjustment.date,
          timeSlot: adjustment.timeSlot,
        });

        facultyAvailability[`${adjustment.date}-${adjustment.timeSlot}`] = response.data.availableFaculty;
      } catch (error) {
        setError(`Error fetching available faculty for class on ${adjustment.date} at ${adjustment.timeSlot}`);
      }
    }

    setAvailableFaculty(facultyAvailability);
  };

  const handleFacultySelection = (key, facultyId) => {
    setSelectedFaculty({ ...selectedFaculty, [key]: facultyId });
  };

  const handleReassignClasses = async () => {
    const reassignmentsArray = [];

    for (const adjustment of adjustments) {
      const key = `${adjustment.date}-${adjustment.timeSlot}`;
      const facultyId = selectedFaculty[key];

      if (facultyId) {
        reassignmentsArray.push({
          classDetails: adjustment,
          newFacultyId: facultyId,
        });
      } else {
        setError(`No faculty selected for class on ${adjustment.date} at ${adjustment.timeSlot}`);
        return;
      }
    }

    setReassignments(reassignmentsArray);
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    setError('');
    setAvailabilityMessage('');

    await handleReassignClasses();

    try {
      const response = await axios.post('http://localhost:8005/faculty-api/reassign-classes', { reassignments });
      if (response.status === 200) {
        const leaveRequestResponse = await axios.post('http://localhost:8005/faculty-api/send-leave-request', { reason, startDate: fromDate, endDate: toDate });

        // Save token to local storage (if applicable)
        if (leaveRequestResponse.data.token) {
          localStorage.setItem('token', leaveRequestResponse.data.token);
        }

        setAvailabilityMessage(leaveRequestResponse.data.message);
        setTimeout(() => navigate('/faculty-home'), 2000);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <Container className="book-leave-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Book a Leave</h1>
          <Form onSubmit={handleCheckAvailability}>
            <Form.Group controlId="formFromDate">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formToDate">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formReason">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Check Availability
            </Button>
          </Form>

          {availabilityMessage && (
            <Alert variant="success" className="mt-3">
              {availabilityMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {adjustments.length > 0 && (
            <>
              <h2 className="mt-5">Classes to Adjust</h2>
              {adjustments.map((adjustment, index) => {
                const key = `${adjustment.date}-${adjustment.timeSlot}`;
                const availableFacultyForClass = availableFaculty[key] || [];

                return (
                  <Alert variant="info" key={index}>
                    {`Class: ${adjustment.className}, Section: ${adjustment.section}, Date: ${adjustment.date}, Time: ${adjustment.timeSlot}`}
                    <div>
                      <h5>Available Faculty:</h5>
                      {availableFacultyForClass.length > 0 ? (
                        <Form.Group controlId={`facultySelect-${key}`}>
                          <Form.Label>Select Faculty</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedFaculty[key] || ''}
                            onChange={(e) => handleFacultySelection(key, e.target.value)}
                          >
                            <option value="">Select Faculty</option>
                            {availableFacultyForClass.map((faculty) => (
                              <option key={faculty.facultyid} value={faculty.facultyid}>
                                {faculty.name}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      ) : (
                        <p>No available faculty for this class.</p>
                      )}
                    </div>
                  </Alert>
                );
              })}
              <Button variant="success" type="button" className="mt-3" onClick={handleSubmitLeaveRequest}>
                Submit Leave Request
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookLeave;



 */


import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './leavebooking.css';

// Set up Axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const BookLeave = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [adjustments, setAdjustments] = useState([]);
  const [reassignments, setReassignments] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState({});
  const [selectedFaculty, setSelectedFaculty] = useState({});
  const navigate = useNavigate();

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setAvailabilityMessage('');
    setAdjustments([]);

    try {
      const response = await axios.post('http://localhost:8001/faculty-api/checkavailability', { fromDate, toDate });
      setAvailabilityMessage(response.data.message);

      // Save token to local storage (if applicable)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      if (response.data.message.includes('Slots available')) {
        await fetchAdjustments();
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const fetchAdjustments = async () => {
    try {
      const response = await axios.post('http://localhost:8001/faculty-api/adjustments', { fromDate, toDate, reason });
      setAdjustments(response.data.classesToAdjust);
      await fetchAvailableFaculty(response.data.classesToAdjust);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const fetchAvailableFaculty = async (classesToAdjust) => {
    const facultyAvailability = {};

    for (const adjustment of classesToAdjust) {
      try {
        const response = await axios.post('http://localhost:8001/faculty-api/available-faculty', {
          date: adjustment.date,
          timeSlot: adjustment.timeSlot,
        });

        facultyAvailability[`${adjustment.date}-${adjustment.timeSlot}`] = response.data.availableFaculty;
      } catch (error) {
        setError(`Error fetching available faculty for class on ${adjustment.date} at ${adjustment.timeSlot}`);
      }
    }

    setAvailableFaculty(facultyAvailability);
  };

  const handleFacultySelection = (key, facultyId) => {
    setSelectedFaculty({ ...selectedFaculty, [key]: facultyId });
  };

  const handleReassignClasses = async () => {
    const reassignmentsArray = [];

    for (const adjustment of adjustments) {
      const key = `${adjustment.date}-${adjustment.timeSlot}`;
      const facultyId = selectedFaculty[key];

      if (facultyId) {
        reassignmentsArray.push({
          classDetails: adjustment,
          newFacultyId: facultyId,
        });
      } else {
        setError(`No faculty selected for class on ${adjustment.date} at ${adjustment.timeSlot}`);
        return;
      }
    }

    setReassignments(reassignmentsArray);
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    setError('');
    setAvailabilityMessage('');

    await handleReassignClasses();

    try {
      const response = await axios.post('http://localhost:8003/faculty-api/reassign-classes', { reassignments });
      if (response.status === 200) {
        const leaveRequestResponse = await axios.post('http://localhost:8003/faculty-api/send-leave-request', { reason, startDate: fromDate, endDate: toDate });

        // Save token to local storage (if applicable)
        if (leaveRequestResponse.data.token) {
          localStorage.setItem('token', leaveRequestResponse.data.token);
        }

        setAvailabilityMessage(leaveRequestResponse.data.message);
        setTimeout(() => navigate('/faculty-home'), 2000);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <Container className="book-leave-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Book a Leave</h1>
          <Form onSubmit={handleCheckAvailability}>
            <Form.Group controlId="formFromDate">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formToDate">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formReason">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Check Availability
            </Button>
          </Form>

          {availabilityMessage && (
            <Alert variant="success" className="mt-3">
              {availabilityMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {adjustments.length > 0 && (
            <>
              <h2 className="mt-5">Classes to Adjust</h2>
              {adjustments.map((adjustment, index) => {
                const key = `${adjustment.date}-${adjustment.timeSlot}`;
                const availableFacultyForClass = availableFaculty[key] || [];

                return (
                  <Alert variant="info" key={index}>
                    {`Class: ${adjustment.className}, Section: ${adjustment.section}, Date: ${adjustment.date}, Time: ${adjustment.timeSlot}`}
                    <div>
                      <h5>Available Faculty:</h5>
                      {availableFacultyForClass.length > 0 ? (
                        <Form.Group controlId={`facultySelect-${key}`}>
                          <Form.Label>Select Faculty</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedFaculty[key] || ''}
                            onChange={(e) => handleFacultySelection(key, e.target.value)}
                          >
                            <option value="">Select Faculty</option>
                            {availableFacultyForClass.map((faculty) => (
                              <option key={faculty.facultyid} value={faculty.facultyid}>
                                {faculty.name}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      ) : (
                        <p>No available faculty for this class.</p>
                      )}
                    </div>
                  </Alert>
                );
              })}
              <Button variant="success" type="button" className="mt-3" onClick={handleSubmitLeaveRequest}>
                Submit Leave Request
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookLeave;
