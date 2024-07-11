//import modules
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setEmployeeDetails } from '../redux/employeeSlice'

const EmployeeDetails = () => {
    //Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);

    //Component router
    const { id } = useParams();

    //Render component
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch(`/api/employee/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch employee details');
                }
                const data = await res.json();
                dispatch(setEmployeeDetails(data));
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchEmployee();
    }, [id, dispatch]);

    //Display DOM
    if (isLoadingState) {
        return <div>Loading...</div>;
    }

    if (errorState) {
        return <div>Error: {errorState}</div>;
    }

    return (
        <div>
            <h2>Employee Details</h2>
            <p>Name: {employeeState.employee_first_name} {employeeState.employee_last_name}</p>
            <p>Email: {employeeState.employee_email}</p>
            <p>Contact: {employeeState.employee_mobile_phone}</p>
            <p>Role: {employeeState.employee_roles}</p>
        </div>
    );
};

export default EmployeeDetails;
