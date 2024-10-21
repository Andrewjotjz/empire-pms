// Import modules
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddEmployee } from '../../hooks/useAddEmployee'; 
import { toast } from 'react-toastify';
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
    const isValidEmail = (email) => {
        const pattern = /[a-zA-Z0-9._%+-]+@empirecbs\.com/;
        return pattern.test(email);
    };

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
        
        if (!isValidEmail(employeeState.employee_email)) {
            // push toast to notify successful login
            toast.error(`Email must be in this format xxxx.xxxx@empirecbs.com!`, {
                position: "bottom-right"
            });
            return;
        }

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
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">First name:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
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
                            <label className="form-label font-bold">Last name:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
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
                            <label className="form-label font-bold">Role:</label>
                            <select 
                                className="form-control cursor-pointer hover:shadow-md"
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
                            <label className="form-label font-bold">Contact:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                name="employee_mobile_phone" 
                                value={employeeState.employee_mobile_phone} 
                                onChange={handleInputChange} 
                                placeholder='04 0000 0000'
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Email:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                name="employee_email" 
                                value={employeeState.employee_email}
                                onChange={handleInputChange}
                                placeholder='yourname@empirecbs.com'
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter email and must be in this format yourname@empirecbs.com')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">Password:</label>
                            <input 
                                type='text'
                                className="form-control placeholder-gray-400 placeholder-opacity-50" 
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
