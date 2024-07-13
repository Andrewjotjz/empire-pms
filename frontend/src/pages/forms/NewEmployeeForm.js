// Import modules
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddEmployee } from '../../hooks/useAddEmployee'; 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";

const NewEmployeeForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const { addEmployee, isLoadingState, errorState } = useAddEmployee();

    // Component state
    const [employeeState, setEmployeeState] = useState({
        employee_first_name: '',
        employee_last_name: '',
        employee_roles: 'Employee',
        employee_mobile_phone: '',
        employee_email: '',
        employee_password: '',
    });

    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/employee/`);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEmployeeState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addEmployee(employeeState);
    };

    // Display DOM
    if (isLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW EMPLOYEE</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-between mb-3">
                        <button type="button" onClick={handleBackClick} className="btn btn-secondary">BACK</button>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">First name:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="employee_first_name" 
                                value={employeeState.employee_first_name} 
                                onChange={handleInputChange}
                                placeholder='First name'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter first name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Last name:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="employee_last_name" 
                                value={employeeState.employee_last_name} 
                                onChange={handleInputChange} 
                                placeholder='Last name'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter last name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Role:</label>
                            <select 
                                className="form-control"
                                name="employee_roles" 
                                value={employeeState.employee_roles} 
                                onChange={handleInputChange}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Foreman">Foreman</option>
                                <option value="Employee">Employee</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Contact:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="employee_mobile_phone" 
                                value={employeeState.employee_mobile_phone} 
                                onChange={handleInputChange} 
                                placeholder='04 0000 0000'
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Email:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="employee_email" 
                                value={employeeState.employee_email}
                                onChange={handleInputChange}
                                placeholder='john.doe@example.com'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter email')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Password:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="employee_password" 
                                value={employeeState.employee_password}
                                onChange={handleInputChange}
                                placeholder='Minimum 6 characters'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter password')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary" type="submit">ADD TO COMPANY</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEmployeeForm;
