//import modules and files
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 
import { useSelector, useDispatch } from 'react-redux'
import { setLocalUser } from '../redux/localUserSlice'

export const useUpdateEmployee = () => {
    //Component's hook state declaration
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState(null);
    const localUserState = useSelector((state) => state.localUserReducer.localUserState)
    const dispatch = useDispatch();

    //Component's hook router
    const navigate = useNavigate();

    //Component's function
    const update = async (employeeState) => {
        setIsLoadingState(true)
        setErrorState(null)

        const putEmployee = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${employeeState._id}`, {
                    credentials: 'include', method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({...employeeState})
                })

                const promise = await res.json();

                if (promise.tokenError) {
                    throw new Error(promise.tokenError)
                }

                if (!res.ok) {
                    throw new Error('Failed to PUT employee details')
                }
                if (res.ok) {
                    //  Need to check if this account being updated is the current user.
                    //  If yes, update localUser in localStorage, dispatch to update localUserState.
                    //  If no, proceed to next code, which is navigate back to Employee Details.
                    if (localUserState.employee_email === employeeState.employee_email) {
                        // save the user to local storage
                        localStorage.setItem('localUser', JSON.stringify(employeeState))
                        // update the localUserState
                        dispatch(setLocalUser(employeeState))
                    }

                    // navigate client to dashboard page
                    navigate(`/EmpirePMS/employee/${employeeState._id}`)
                
                    alert(`Account updated successfully!`);
                
                    // update loading state
                    setIsLoadingState(false)

                }
            } catch (error) {
                setErrorState(error.message);
                setIsLoadingState(false);
            }
        }
        putEmployee();
    }

    return { update, isLoadingState, errorState };
}