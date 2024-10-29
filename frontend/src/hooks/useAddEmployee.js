//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAddEmployee = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const addEmployee = async (employeeState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const postEmployee = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(employeeState)
                })

                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to POST new employee details')
                }
                if (res.ok) {
                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/employee/`)

                    alert(`Employee account added successfully!`);
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        postEmployee();
    }

    return { addEmployee, isLoadingState, errorState };
}