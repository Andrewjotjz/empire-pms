import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProjectDetails = () => {
    const [projectDetails, setProjectDetails] = useState(null); // Initialize as null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isArchive, setIsArchive] = useState(false);

    const { id } = useParams(); // Extract projectId from URL
    const navigate = useNavigate(); // Component router

    const handleTableEmployeeClick = (varID) => {
        navigate(`/EmpirePMS/employee/${varID}`, { state: varID });
    }

    const handleTableClick2 = (varID) => {
        navigate(`/EmpirePMS/supplier/${varID}`, { state: varID });
    }

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const res = await fetch(`/api/project/${id}`);
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const projectData = await res.json();
                setProjectDetails(projectData[0]);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [id]);  // Add id as dependency

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!projectDetails) return <p>No project details available</p>;

    return (
        <div className="">
            <div>
                <label><b>Project Id: </b></label>
                <div>{id}</div>
            </div>
            <div>
                <label><b>Project Name:</b></label>
                <div>{projectDetails.project_name}</div>
            </div>
            <div>
                <label><b>Project Address: </b></label>
                <div>{projectDetails.project_address}</div>
            </div>
            <div>
                <label><b>Project Status: </b></label>
                <div>{projectDetails.project_isarchived ? 'Archived' : 'Active'}</div>
            </div>
            <div>
                <label><b>Project Contact Person: </b></label>
                <div>
                    <ul>
                        {projectDetails.employees && projectDetails.employees.length > 0 ? (
                            projectDetails.employees
                                .filter(employee => employee.employee_roles === 'Foreman')
                                .map((employee) => (
                                    <li key={employee._id}>{employee.employee_first_name} {employee.employee_last_name}: {employee.employee_mobile_phone}</li>
                                ))
                        ) : (
                            <li>No related Contact Person</li>
                        )}
                    </ul>
                </div>
            </div>
            <div>
                <label><b>Project Related Employees: </b></label>
                <div>
                    <ul>
                        {projectDetails.employees && projectDetails.employees.length > 0 ? (
                            projectDetails.employees
                                .filter(employee => employee.employee_roles !== 'Foreman')
                                .map((employee) => (
                                    <li key={employee._id} onClick={() => handleTableEmployeeClick( employee._id)}>
                                        {employee.employee_first_name} {employee.employee_last_name}: {employee.employee_mobile_phone}
                                    </li>
                                ))
                        ) : (
                            <li>No related Contact Person</li>
                        )}
                    </ul>
                </div>
            </div>
            <div>
                <label><b>Project Related Suppliers: </b></label>
                <ul>
                    {projectDetails.suppliers && projectDetails.suppliers.length > 0 ? (
                        projectDetails.suppliers
                            .filter(supplier => supplier.supplier_isarchived === isArchive)
                            .map((supplier) => (
                                <li key={supplier._id} onClick={() => handleTableClick2(supplier._id)}>
                                    {supplier.supplier_name} Status: {supplier.supplier_isarchived ? 'Archived' : 'Active'}
                                </li>
                            ))
                    ) : (
                        <li>No related suppliers</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProjectDetails;
