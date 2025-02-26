//import modules
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const Dashboard = () => {

    const localUser = JSON.parse(localStorage.getItem('localUser'))

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <Container className="dashboard">
            <h1 className='mb-3 text-3xl font-bold'>Dashboard</h1>
            <Row>
                <Col md={6}>
                    <Card className="mb-4 bg-indigo-100">
                        <Card.Body>
                            <Link to="/EmpirePMS/order"><Card.Title>Purchase Order Summary</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Purchase Order Summary content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-indigo-100">
                        <Card.Body>
                        <Link to="/EmpirePMS/invoice"><Card.Title>Invoices</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-indigo-100">
                        <Card.Body>
                        <Link to="/EmpirePMS/delivery"><Card.Title>Deliveries</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-indigo-100">
                        <Card.Body>
                        <Link to="/EmpirePMS/payment"><Card.Title>Payments</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Payments content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-purple-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/employee"><Card.Title>Employees</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Employees content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-purple-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/supplier"><Card.Title>Suppliers</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Suppliers content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-purple-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/project"><Card.Title>Projects</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Projects content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-blue-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/product-type"><Card.Title>Product Types</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-blue-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/budget"><Card.Title>Budgets</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 bg-blue-50">
                        <Card.Body>
                        <Link to="/EmpirePMS/product"><Card.Title>Products</Card.Title></Link>
                            <Card.Text>
                                {/* Insert Invoices content here */}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container> ) : ( <UnauthenticatedSkeleton /> )
    );
}

export default Dashboard;
