//import modules
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
    return (
        <Container className="dashboard">
            <h1 className='mb-3 text-3xl font-bold'>Dashboard</h1>
            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Link to="/EmpirePMS/order"><Card.Title>Purchase Order Summary</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Purchase Order Summary content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                        <Link to="/EmpirePMS/project"><Card.Title>Projects</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Projects content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                        <Link to="/EmpirePMS/employee"><Card.Title>Employees</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Employees content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                        <Link to="/EmpirePMS/supplier"><Card.Title>Suppliers</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Suppliers content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                        <Link to="/EmpirePMS/payment"><Card.Title>Payments</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Payments content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                        <Link to="/EmpirePMS/invoice"><Card.Title>Invoices</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;
